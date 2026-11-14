"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { calcCost, suppliesCost, type SupplyUse } from "@/lib/calc";
import { getContext, getMaterials, getPrinters, getSettings, getSupplies } from "@/lib/data";
import { fnum, friendlyError, fstr } from "@/lib/format";
import { autoDeductSale } from "./gestao-actions";
import { getT } from "@/i18n/server";

const back = (path: string, kind: "ok" | "erro", msg: string): never => {
  revalidatePath("/", "layout");
  redirect(`${path}?${kind}=${encodeURIComponent(msg)}`);
};

// ---------------- Configurações ----------------
export async function saveSettings(fd: FormData) {
  const t = await getT();
  const f = t.flash;
  const { supabase, accountId } = await getContext();
  const { error } = await supabase.from("settings").upsert({
    user_id: accountId,
    business_name: fstr(fd, "business_name"),
    energy_price_kwh: fnum(fd, "energy_price_kwh", 0.95),
    labor_per_hour: fnum(fd, "labor_per_hour"),
    failure_rate_pct: Math.min(fnum(fd, "failure_rate_pct"), 90),
    default_margin_pct: Math.min(fnum(fd, "default_margin_pct", 50), 95),
    updated_at: new Date().toISOString(),
  });
  if (error) back("/configuracoes", "erro", friendlyError(error.message, t.common.errors));
  back("/configuracoes", "ok", f.costsSaved);
}

// ---------------- Canais ----------------
export async function saveChannel(fd: FormData) {
  const t = await getT();
  const f = t.flash;
  const { supabase, accountId } = await getContext();
  const id = fstr(fd, "id");
  const row = {
    user_id: accountId,
    name: fstr(fd, "name") ?? f.defaults.channel,
    fee_pct: Math.min(fnum(fd, "fee_pct"), 90),
    fee_fixed: fnum(fd, "fee_fixed"),
  };
  const { error } = id
    ? await supabase.from("channels").update(row).eq("id", id)
    : await supabase.from("channels").insert(row);
  if (error) back("/configuracoes", "erro", friendlyError(error.message, t.common.errors));
  back("/configuracoes", "ok", f.channelSaved);
}

export async function deleteChannel(fd: FormData) {
  const t = await getT();
  const f = t.flash;
  const { supabase } = await getContext();
  await supabase.from("channels").delete().eq("id", String(fd.get("id")));
  back("/configuracoes", "ok", f.channelRemoved);
}

// ---------------- Impressoras ----------------
export async function savePrinter(fd: FormData) {
  const t = await getT();
  const f = t.flash;
  const { supabase, accountId } = await getContext();
  const id = fstr(fd, "id");
  const row = {
    user_id: accountId,
    name: fstr(fd, "name") ?? f.defaults.printer,
    power_watts: fnum(fd, "power_watts", 150),
    purchase_price: fnum(fd, "purchase_price"),
    lifetime_hours: Math.max(fnum(fd, "lifetime_hours", 5000), 1),
    maintenance_per_hour: fnum(fd, "maintenance_per_hour"),
  };
  const { error } = id
    ? await supabase.from("printers").update(row).eq("id", id)
    : await supabase.from("printers").insert(row);
  if (error) back("/impressoras", "erro", friendlyError(error.message, t.common.errors));
  back("/impressoras", "ok", id ? f.printerUpdated : f.printerCreated);
}

export async function deletePrinter(fd: FormData) {
  const t = await getT();
  const f = t.flash;
  const { supabase } = await getContext();
  await supabase.from("printers").delete().eq("id", String(fd.get("id")));
  back("/impressoras", "ok", f.printerRemoved);
}

// ---------------- Materiais ----------------
export async function saveMaterial(fd: FormData) {
  const t = await getT();
  const f = t.flash;
  const { supabase, accountId } = await getContext();
  const id = fstr(fd, "id");
  const row = {
    user_id: accountId,
    name: fstr(fd, "name") ?? f.defaults.material,
    type: fstr(fd, "type") ?? "PLA",
    color: fstr(fd, "color"),
    price_per_kg: fnum(fd, "price_per_kg"),
  };
  const { error } = id
    ? await supabase.from("materials").update(row).eq("id", id)
    : await supabase.from("materials").insert(row);
  if (error) back("/materiais", "erro", friendlyError(error.message, t.common.errors));
  back("/materiais", "ok", id ? f.materialUpdated : f.materialCreated);
}

export async function deleteMaterial(fd: FormData) {
  const t = await getT();
  const f = t.flash;
  const { supabase } = await getContext();
  await supabase.from("materials").delete().eq("id", String(fd.get("id")));
  back("/materiais", "ok", f.materialRemoved);
}

// ---------------- Insumos ----------------
export async function saveSupply(fd: FormData) {
  const t = await getT();
  const f = t.flash;
  const { supabase, accountId } = await getContext();
  const id = fstr(fd, "id");
  const row = {
    user_id: accountId,
    name: fstr(fd, "name") ?? f.defaults.supply,
    unit: fstr(fd, "unit") ?? f.defaults.unit,
    unit_price: fnum(fd, "unit_price"),
  };
  const { error } = id
    ? await supabase.from("supplies").update(row).eq("id", id)
    : await supabase.from("supplies").insert(row);
  if (error) back("/insumos", "erro", friendlyError(error.message, t.common.errors));
  back("/insumos", "ok", id ? f.supplyUpdated : f.supplyCreated);
}

export async function deleteSupply(fd: FormData) {
  const t = await getT();
  const f = t.flash;
  const { supabase } = await getContext();
  await supabase.from("supplies").delete().eq("id", String(fd.get("id")));
  back("/insumos", "ok", f.supplyRemoved);
}

/** Lê a lista de insumos enviada pelo formulário do produto. */
function parseSupplyUses(fd: FormData): SupplyUse[] {
  try {
    const raw = JSON.parse(String(fd.get("supplies") ?? "[]"));
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((u) => u && typeof u.supply_id === "string" && Number(u.qty) > 0)
      .slice(0, 30)
      .map((u) => ({ supply_id: u.supply_id, qty: Number(u.qty) }));
  } catch {
    return [];
  }
}

// ---------------- Produtos ----------------
/** Recalcula o custo no servidor (nunca confia no valor vindo do navegador). */
async function computeUnitCost(fd: FormData, uses: SupplyUse[]) {
  const [settings, printers, materials, supplies] = await Promise.all([getSettings(), getPrinters(), getMaterials(), getSupplies()]);
  const printer = printers.find((p) => p.id === fstr(fd, "printer_id"));
  const material = materials.find((m) => m.id === fstr(fd, "material_id"));
  return calcCost({
    weightG: fnum(fd, "weight_g"),
    printHours: fnum(fd, "print_hours"),
    materialPricePerKg: material?.price_per_kg ?? 0,
    printerWatts: printer?.power_watts ?? 0,
    energyPricePerKwh: settings.energy_price_kwh,
    printerPrice: printer?.purchase_price ?? 0,
    printerLifetimeHours: printer?.lifetime_hours ?? 0,
    maintenancePerHour: printer?.maintenance_per_hour ?? 0,
    laborMinutes: fnum(fd, "labor_minutes"),
    laborPerHour: settings.labor_per_hour,
    failureRatePct: settings.failure_rate_pct,
    extraCosts: fnum(fd, "extra_costs"),
    suppliesCost: suppliesCost(uses, new Map(supplies.map((x) => [x.id, x.unit_price]))),
  }).total;
}

export async function saveProduct(fd: FormData) {
  const t = await getT();
  const f = t.flash;
  const { supabase, accountId } = await getContext();
  const id = fstr(fd, "id");
  const uses = parseSupplyUses(fd);
  const row = {
    user_id: accountId,
    name: fstr(fd, "name") ?? f.defaults.product,
    category: fstr(fd, "category"),
    printer_id: fstr(fd, "printer_id"),
    material_id: fstr(fd, "material_id"),
    weight_g: fnum(fd, "weight_g"),
    print_hours: fnum(fd, "print_hours"),
    labor_minutes: fnum(fd, "labor_minutes"),
    extra_costs: fnum(fd, "extra_costs"),
    sale_price: fnum(fd, "sale_price"),
    notes: fstr(fd, "notes"),
    supplies: uses,
    unit_cost: await computeUnitCost(fd, uses),
    updated_at: new Date().toISOString(),
  };
  const { error } = id
    ? await supabase.from("products").update(row).eq("id", id)
    : await supabase.from("products").insert(row);
  if (error) back(id ? `/produtos/${id}` : "/produtos/novo", "erro", friendlyError(error.message, t.common.errors));
  back("/produtos", "ok", id ? f.productUpdated : f.productCreated);
}

export async function deleteProduct(fd: FormData) {
  const t = await getT();
  const f = t.flash;
  const { supabase } = await getContext();
  await supabase.from("products").delete().eq("id", String(fd.get("id")));
  back("/produtos", "ok", f.productRemoved);
}

/** Recalcula o custo de todos os produtos (após mudar custos ou impressoras). */
export async function recalcAllProducts() {
  const t = await getT();
  const f = t.flash;
  const { supabase } = await getContext();
  const [settings, printers, materials, supplies, { data: products }] = await Promise.all([
    getSettings(),
    getPrinters(),
    getMaterials(),
    getSupplies(),
    supabase.from("products").select("*"),
  ]);
  const prices = new Map(supplies.map((x) => [x.id, x.unit_price]));
  for (const p of products ?? []) {
    const printer = printers.find((x) => x.id === p.printer_id);
    const material = materials.find((x) => x.id === p.material_id);
    const total = calcCost({
      weightG: Number(p.weight_g),
      printHours: Number(p.print_hours),
      materialPricePerKg: material?.price_per_kg ?? 0,
      printerWatts: printer?.power_watts ?? 0,
      energyPricePerKwh: settings.energy_price_kwh,
      printerPrice: printer?.purchase_price ?? 0,
      printerLifetimeHours: printer?.lifetime_hours ?? 0,
      maintenancePerHour: printer?.maintenance_per_hour ?? 0,
      laborMinutes: Number(p.labor_minutes),
      laborPerHour: settings.labor_per_hour,
      failureRatePct: settings.failure_rate_pct,
      extraCosts: Number(p.extra_costs),
      suppliesCost: suppliesCost(p.supplies as SupplyUse[], prices),
    }).total;
    await supabase.from("products").update({ unit_cost: total }).eq("id", p.id);
  }
  back("/produtos", "ok", f.allRecalculated);
}

// ---------------- Vendas ----------------
export async function saveSale(fd: FormData) {
  const t = await getT();
  const f = t.flash;
  const { supabase, accountId } = await getContext();
  const productId = fstr(fd, "product_id");
  const channelId = fstr(fd, "channel_id");

  const [{ data: product }, { data: channel }] = await Promise.all([
    productId
      ? supabase.from("products").select("name, category, unit_cost").eq("id", productId).maybeSingle()
      : Promise.resolve({ data: null }),
    channelId
      ? supabase.from("channels").select("fee_pct, fee_fixed").eq("id", channelId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const quantity = Math.max(1, Math.round(fnum(fd, "quantity", 1)));
  const unitPrice = fnum(fd, "unit_price");
  if (unitPrice <= 0) back("/vendas", "erro", f.saleNeedsPrice);

  const row = {
    user_id: accountId,
    product_id: productId,
    channel_id: channelId,
    description: fstr(fd, "description") ?? product?.name ?? f.defaults.looseSale,
    category: product?.category ?? fstr(fd, "category"),
    quantity,
    unit_price: unitPrice,
    unit_cost: product ? Number(product.unit_cost) : fnum(fd, "unit_cost"),
    fee_pct: channel ? Number(channel.fee_pct) : 0,
    fee_fixed: channel ? Number(channel.fee_fixed) : 0,
    shipping_cost: fnum(fd, "shipping_cost"),
    sold_at: fstr(fd, "sold_at") ?? new Date().toISOString().slice(0, 10),
  };
  const { error } = await supabase.from("sales").insert(row);
  if (error) back("/vendas", "erro", friendlyError(error.message, t.common.errors));
  await autoDeductSale(productId, quantity, row.description);
  back("/vendas", "ok", f.saleCreated);
}

export async function deleteSale(fd: FormData) {
  const t = await getT();
  const f = t.flash;
  const { supabase } = await getContext();
  await supabase.from("sales").delete().eq("id", String(fd.get("id")));
  back("/vendas", "ok", f.saleRemoved);
}
