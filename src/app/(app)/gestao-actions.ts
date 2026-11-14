"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getContext, getMaterials, getProducts, getSupplies } from "@/lib/data";
import { fnum, friendlyError, fstr } from "@/lib/format";
import { cleanItems, itemsTotals, stockNeeds, type Item, type OrderStatus, type QuoteStatus } from "@/lib/orders";
import { hasFeature } from "@/lib/plans";
import { getT } from "@/i18n/server";

const back = (path: string, kind: "ok" | "erro", msg: string): never => {
  revalidatePath("/", "layout");
  redirect(`${path}${path.includes("?") ? "&" : "?"}${kind}=${encodeURIComponent(msg)}`);
};

async function ctx(feature: "gestao" | "automacoes" | "equipe" = "gestao", path = "/pedidos") {
  const c = await getContext();
  const t = await getT();
  if (!hasFeature(c.plan, feature)) {
    back(path, "erro", feature === "gestao" ? t.gestao.flash.needPro : t.gestao.flash.needBusiness);
  }
  return { ...c, t, g: t.gestao, f: t.gestao.flash, e: t.common.errors };
}

function parseItems(fd: FormData): Item[] {
  try {
    return cleanItems(JSON.parse(String(fd.get("items") ?? "[]")));
  } catch {
    return [];
  }
}

const isoDate = (v: string | null) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);

// =====================================================================
// Estoque
// =====================================================================

/** Desconta filamento e insumos usados nos itens. Retorna quantos itens mexeu. */
async function deductForItems(items: Item[], reason: string, orderId: string | null) {
  const { supabase, accountId, user } = await getContext();
  const [products, materials, supplies] = await Promise.all([getProducts(), getMaterials(), getSupplies()]);
  const need = stockNeeds(items, products);
  const moves: Record<string, unknown>[] = [];
  for (const [id, g] of need.materials) {
    const m = materials.find((x) => x.id === id);
    if (!m) continue;
    await supabase.from("materials").update({ stock_g: Math.round((m.stock_g - g) * 100) / 100 }).eq("id", id);
    moves.push({ user_id: accountId, item_type: "material", item_id: id, item_name: m.name, qty: -g, reason, order_id: orderId, created_by: user.id });
  }
  for (const [id, q] of need.supplies) {
    const s = supplies.find((x) => x.id === id);
    if (!s) continue;
    await supabase.from("supplies").update({ stock_qty: Math.round((s.stock_qty - q) * 100) / 100 }).eq("id", id);
    moves.push({ user_id: accountId, item_type: "supply", item_id: id, item_name: s.name, qty: -q, reason, order_id: orderId, created_by: user.id });
  }
  if (moves.length) await supabase.from("stock_movements").insert(moves);
  return moves.length;
}

/** Automação do plano Empresa: venda avulsa com produto dá baixa no estoque. */
export async function autoDeductSale(productId: string | null, quantity: number, description: string) {
  const { plan } = await getContext();
  if (!productId || !hasFeature(plan, "automacoes")) return;
  await deductForItems([{ product_id: productId, description, qty: quantity, unit_price: 0, unit_cost: 0 }], (await getT()).gestao.saleReason(description), null);
}

export async function moveStock(fd: FormData) {
  const { supabase, accountId, user, g, f, e } = await ctx("gestao", "/estoque");
  const [rawType, rawId] = (fstr(fd, "item") ?? "").split(":");
  const type = (fstr(fd, "item_type") ?? rawType ?? null) as "material" | "supply" | "product" | null;
  const id = fstr(fd, "item_id") ?? rawId ?? null;
  const kind = fstr(fd, "kind") ?? "entrada";
  const qty = Math.abs(fnum(fd, "qty"));
  if (!type || !id || (qty <= 0 && kind !== "ajuste")) back("/estoque", "erro", f.chooseItem);

  const table = type === "material" ? "materials" : type === "supply" ? "supplies" : "products";
  const col = type === "material" ? "stock_g" : "stock_qty";
  const { data: item } = await supabase.from(table).select(`name, ${col}`).eq("id", id!).maybeSingle();
  if (!item) back("/estoque", "erro", f.itemNotFound);
  const current = Number((item as Record<string, unknown>)[col]) || 0;
  const next = kind === "entrada" ? current + qty : kind === "saida" ? current - qty : qty;
  const delta = next - current;

  const { error } = await supabase.from(table).update({ [col]: next }).eq("id", id!);
  if (error) back("/estoque", "erro", friendlyError(error.message, e));
  await supabase.from("stock_movements").insert({
    user_id: accountId,
    item_type: type,
    item_id: id,
    item_name: (item as { name: string }).name,
    qty: delta,
    reason: fstr(fd, "reason") ?? (kind === "entrada" ? g.moveReason.entrada : kind === "saida" ? g.moveReason.saida : g.moveReason.ajuste),
    created_by: user.id,
  });
  back("/estoque", "ok", f.stockUpdated);
}

export async function setStockMin(fd: FormData) {
  const { supabase, f } = await ctx("gestao", "/estoque");
  const type = fstr(fd, "item_type");
  const id = fstr(fd, "item_id");
  const min = Math.max(0, fnum(fd, "min"));
  if (!id) back("/estoque", "erro", f.itemNotFound);
  if (type === "material") await supabase.from("materials").update({ min_stock_g: min }).eq("id", id!);
  else if (type === "supply") await supabase.from("supplies").update({ min_qty: min }).eq("id", id!);
  else await supabase.from("products").update({ min_qty: min }).eq("id", id!);
  back("/estoque", "ok", f.minSaved);
}

// =====================================================================
// Orçamentos
// =====================================================================

export async function saveQuote(fd: FormData) {
  const { supabase, accountId, user, f, e } = await ctx("gestao", "/orcamentos");
  const id = fstr(fd, "id");
  const items = parseItems(fd);
  const path = id ? `/orcamentos/${id}/editar` : "/orcamentos/novo";
  if (!fstr(fd, "customer_name")) back(path, "erro", f.needCustomer);
  if (items.length === 0) back(path, "erro", f.needItem);
  const row = {
    user_id: accountId,
    customer_name: fstr(fd, "customer_name")!,
    customer_phone: fstr(fd, "customer_phone"),
    items,
    discount: Math.max(0, fnum(fd, "discount")),
    shipping: Math.max(0, fnum(fd, "shipping")),
    channel_id: fstr(fd, "channel_id"),
    valid_until: isoDate(fstr(fd, "valid_until")),
    delivery_days: fstr(fd, "delivery_days") ? Math.max(0, Math.round(fnum(fd, "delivery_days"))) : null,
    notes: fstr(fd, "notes"),
  };
  if (id) {
    const { error } = await supabase.from("quotes").update(row).eq("id", id);
    if (error) back(path, "erro", friendlyError(error.message, e));
    back(`/orcamentos/${id}`, "ok", f.quoteUpdated);
  }
  const { data, error } = await supabase.from("quotes").insert({ ...row, created_by: user.id }).select("id").single();
  if (error || !data) back(path, "erro", friendlyError(error?.message, e));
  back(`/orcamentos/${data!.id}`, "ok", f.quoteCreated);
}

export async function setQuoteStatus(fd: FormData) {
  const { supabase, f } = await ctx("gestao", "/orcamentos");
  const id = String(fd.get("id"));
  const status = String(fd.get("status")) as QuoteStatus;
  if (!["aberto", "enviado", "aprovado", "recusado"].includes(status)) back(`/orcamentos/${id}`, "erro", f.badStatus);
  await supabase.from("quotes").update({ status, approved_at: status === "aprovado" ? new Date().toISOString() : null }).eq("id", id);
  back(`/orcamentos/${id}`, "ok", f.statusUpdated);
}

export async function deleteQuote(fd: FormData) {
  const { supabase, f } = await ctx("gestao", "/orcamentos");
  await supabase.from("quotes").delete().eq("id", String(fd.get("id")));
  back("/orcamentos", "ok", f.quoteRemoved);
}

/** Empresa: gera o link público para o cliente ver e aprovar. */
export async function shareQuote(fd: FormData) {
  const id = String(fd.get("id"));
  const { supabase, f } = await ctx("automacoes", `/orcamentos/${id}`);
  const { data: q } = await supabase.from("quotes").select("public_token, status").eq("id", id).maybeSingle();
  if (!q) back("/orcamentos", "erro", f.quoteNotFound);
  if (!q!.public_token) {
    const token = randomBytes(18).toString("base64url");
    await supabase
      .from("quotes")
      .update({ public_token: token, status: q!.status === "aberto" ? "enviado" : q!.status })
      .eq("id", id);
  }
  back(`/orcamentos/${id}`, "ok", f.linkReady);
}

/** Empresa: orçamento aprovado vira pedido com 1 clique. */
export async function convertQuote(fd: FormData) {
  const id = String(fd.get("id"));
  const { supabase, accountId, user, f, e } = await ctx("automacoes", `/orcamentos/${id}`);
  const { data: q } = await supabase.from("quotes").select("*").eq("id", id).maybeSingle();
  if (!q) back("/orcamentos", "erro", f.quoteNotFound);
  if (q!.order_id) back(`/pedidos/${q!.order_id}`, "ok", f.alreadyOrder);
  const due = q!.delivery_days != null ? new Date(Date.now() + Number(q!.delivery_days) * 864e5).toISOString().slice(0, 10) : null;
  const { data: o, error } = await supabase
    .from("orders")
    .insert({
      user_id: accountId,
      quote_id: q!.id,
      customer_name: q!.customer_name,
      customer_phone: q!.customer_phone,
      items: q!.items,
      discount: q!.discount,
      shipping: q!.shipping,
      channel_id: q!.channel_id,
      due_date: due,
      notes: q!.notes,
      created_by: user.id,
    })
    .select("id")
    .single();
  if (error || !o) back(`/orcamentos/${id}`, "erro", friendlyError(error?.message, e));
  await supabase.from("quotes").update({ status: "convertido", order_id: o!.id, approved_at: new Date().toISOString() }).eq("id", id);
  back(`/pedidos/${o!.id}`, "ok", f.converted);
}

// =====================================================================
// Pedidos
// =====================================================================

export async function saveOrder(fd: FormData) {
  const { supabase, accountId, user, f, e } = await ctx("gestao", "/pedidos");
  const id = fstr(fd, "id");
  const items = parseItems(fd);
  const path = id ? `/pedidos/${id}/editar` : "/pedidos/novo";
  if (!fstr(fd, "customer_name")) back(path, "erro", f.needCustomer);
  if (items.length === 0) back(path, "erro", f.needItem);
  const row = {
    user_id: accountId,
    customer_name: fstr(fd, "customer_name")!,
    customer_phone: fstr(fd, "customer_phone"),
    items,
    discount: Math.max(0, fnum(fd, "discount")),
    shipping: Math.max(0, fnum(fd, "shipping")),
    shipping_cost: Math.max(0, fnum(fd, "shipping_cost")),
    channel_id: fstr(fd, "channel_id"),
    due_date: isoDate(fstr(fd, "due_date")),
    assigned_to: fstr(fd, "assigned_to"),
    notes: fstr(fd, "notes"),
  };
  if (id) {
    const { error } = await supabase.from("orders").update(row).eq("id", id);
    if (error) back(path, "erro", friendlyError(error.message, e));
    back(`/pedidos/${id}`, "ok", f.orderUpdated);
  }
  const { data, error } = await supabase.from("orders").insert({ ...row, created_by: user.id }).select("id").single();
  if (error || !data) back(path, "erro", friendlyError(error?.message, e));
  back(`/pedidos/${data!.id}`, "ok", f.orderCreated);
}

export async function deleteOrder(fd: FormData) {
  const { supabase, f } = await ctx("gestao", "/pedidos");
  await supabase.from("orders").delete().eq("id", String(fd.get("id")));
  back("/pedidos", "ok", f.orderRemoved);
}

/** Lança as vendas do pedido (o lucro aparece no painel). */
async function registerSales(orderId: string) {
  const { supabase, accountId } = await getContext();
  const g = (await getT()).gestao;
  const { data: o } = await supabase.from("orders").select("*").eq("id", orderId).maybeSingle();
  if (!o || o.sale_registered) return false;
  const items = cleanItems(o.items);
  if (!items.length) return false;
  const { data: channel } = o.channel_id
    ? await supabase.from("channels").select("fee_pct, fee_fixed").eq("id", o.channel_id).maybeSingle()
    : { data: null };
  const { data: prods } = await supabase.from("products").select("id, category").in(
    "id",
    items.map((i) => i.product_id).filter(Boolean) as string[],
  );
  const t = itemsTotals(items, Number(o.discount), Number(o.shipping));
  // Desconto e frete cobrado entram proporcionalmente no preço de cada item.
  const factor = t.subtotal > 0 ? t.total / t.subtotal : 1;
  const soldAt = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  const rows = items.map((i, idx) => ({
    user_id: accountId,
    order_id: orderId,
    product_id: i.product_id,
    channel_id: o.channel_id,
    description: g.orderSaleDesc(i.description, o.number),
    category: prods?.find((p) => p.id === i.product_id)?.category ?? null,
    quantity: i.qty,
    unit_price: Math.round(i.unit_price * factor * 100) / 100,
    unit_cost: i.unit_cost,
    fee_pct: channel ? Number(channel.fee_pct) : 0,
    fee_fixed: idx === 0 && channel ? Number(channel.fee_fixed) : 0,
    shipping_cost: idx === 0 ? Number(o.shipping_cost) : 0,
    sold_at: soldAt,
  }));
  const { error } = await supabase.from("sales").insert(rows);
  if (error) return false;
  await supabase.from("orders").update({ sale_registered: true }).eq("id", orderId);
  return true;
}

async function deductOrder(orderId: string) {
  const { supabase } = await getContext();
  const { data: o } = await supabase.from("orders").select("items, number, stock_deducted").eq("id", orderId).maybeSingle();
  if (!o || o.stock_deducted) return 0;
  const n = await deductForItems(cleanItems(o.items), (await getT()).gestao.orderReason(o.number), orderId);
  await supabase.from("orders").update({ stock_deducted: true }).eq("id", orderId);
  return n;
}

export async function setOrderStatus(fd: FormData) {
  const id = String(fd.get("id"));
  const { supabase, plan, g, f } = await ctx("gestao", `/pedidos/${id}`);
  const status = String(fd.get("status")) as OrderStatus;
  if (!["novo", "producao", "pronto", "entregue", "cancelado"].includes(status)) back(`/pedidos/${id}`, "erro", f.badStatus);
  await supabase
    .from("orders")
    .update({ status, delivered_at: status === "entregue" ? new Date().toISOString() : null })
    .eq("id", id);

  const notes: string[] = [];
  if (hasFeature(plan, "automacoes")) {
    if (["producao", "pronto", "entregue"].includes(status)) {
      const n = await deductOrder(id);
      if (n) notes.push(f.autoStock);
    }
    if (status === "entregue" && (await registerSales(id))) notes.push(f.autoSale);
  }
  back(`/pedidos/${id}`, "ok", f.statusSet(g.orderStatus[status], notes));
}

/** Profissional: lança a venda com 1 clique (no Empresa é automático). */
export async function registerOrderSale(fd: FormData) {
  const id = String(fd.get("id"));
  const { f } = await ctx("gestao", `/pedidos/${id}`);
  const ok = await registerSales(id);
  back(`/pedidos/${id}`, ok ? "ok" : "erro", ok ? f.saleRegistered : f.saleAlready);
}

/** Profissional: dá baixa no estoque com 1 clique (no Empresa é automático). */
export async function deductOrderStock(fd: FormData) {
  const id = String(fd.get("id"));
  const { f } = await ctx("gestao", `/pedidos/${id}`);
  const n = await deductOrder(id);
  back(`/pedidos/${id}`, "ok", n ? f.stockDeducted : f.nothingToDeduct);
}

// =====================================================================
// Equipe
// =====================================================================

export async function inviteMember(fd: FormData) {
  const { supabase, user, role, f, e } = await ctx("equipe", "/equipe");
  if (role !== "dono") back("/equipe", "erro", f.ownerOnly);
  const email = (fstr(fd, "email") ?? "").toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) back("/equipe", "erro", f.badEmail);
  if (email === (user.email ?? "").toLowerCase()) back("/equipe", "erro", f.ownEmail);
  const { error } = await supabase.from("team_members").insert({ owner_id: user.id, email, name: fstr(fd, "name") });
  if (error) back("/equipe", "erro", error.message.includes("duplicate") ? f.alreadyInvited : friendlyError(error.message, e));
  back("/equipe", "ok", f.invited);
}

export async function removeMember(fd: FormData) {
  const { supabase, user, f } = await ctx("equipe", "/equipe");
  await supabase.from("team_members").delete().eq("id", String(fd.get("id"))).eq("owner_id", user.id);
  back("/equipe", "ok", f.memberRemoved);
}
