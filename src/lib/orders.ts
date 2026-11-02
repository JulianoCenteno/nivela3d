/** Orçamentos, pedidos e estoque — tipos e contas (sem acesso ao banco). */

export interface Item {
  product_id: string | null;
  description: string;
  qty: number;
  unit_price: number;
  unit_cost: number;
}

export type QuoteStatus = "aberto" | "enviado" | "aprovado" | "recusado" | "convertido";
export type OrderStatus = "novo" | "producao" | "pronto" | "entregue" | "cancelado";

export interface QuoteRow {
  id: string;
  number: number;
  customer_name: string;
  customer_phone: string | null;
  items: Item[];
  discount: number;
  shipping: number;
  channel_id: string | null;
  valid_until: string | null;
  delivery_days: number | null;
  notes: string | null;
  status: QuoteStatus;
  public_token: string | null;
  order_id: string | null;
  created_at: string;
}

export interface OrderRow {
  id: string;
  number: number;
  quote_id: string | null;
  customer_name: string;
  customer_phone: string | null;
  items: Item[];
  discount: number;
  shipping: number;
  shipping_cost: number;
  channel_id: string | null;
  due_date: string | null;
  status: OrderStatus;
  notes: string | null;
  assigned_to: string | null;
  stock_deducted: boolean;
  sale_registered: boolean;
  delivered_at: string | null;
  created_at: string;
}

export const QUOTE_STATUS: Record<QuoteStatus, { label: string; tone: string }> = {
  aberto: { label: "Em aberto", tone: "bg-surface-2 text-ink-2" },
  enviado: { label: "Enviado", tone: "bg-sand-soft text-ink-2" },
  aprovado: { label: "Aprovado", tone: "bg-primary-soft text-primary" },
  recusado: { label: "Recusado", tone: "bg-negative-soft text-negative" },
  convertido: { label: "Virou pedido", tone: "bg-primary-soft text-primary" },
};

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: string }> = {
  novo: { label: "Novo", tone: "bg-sand-soft text-ink-2" },
  producao: { label: "Em produção", tone: "bg-primary-soft text-primary" },
  pronto: { label: "Pronto", tone: "bg-primary-soft text-primary" },
  entregue: { label: "Entregue", tone: "bg-surface-2 text-muted" },
  cancelado: { label: "Cancelado", tone: "bg-negative-soft text-negative" },
};

export const ORDER_FLOW: OrderStatus[] = ["novo", "producao", "pronto", "entregue"];

const n = (v: unknown) => (Number.isFinite(Number(v)) ? Number(v) : 0);

export function cleanItems(raw: unknown): Item[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((i) => i && (String(i.description ?? "").trim() || i.product_id))
    .slice(0, 50)
    .map((i) => ({
      product_id: typeof i.product_id === "string" && i.product_id ? i.product_id : null,
      description: String(i.description ?? "").trim().slice(0, 200) || "Item",
      qty: Math.max(1, Math.round(n(i.qty) || 1)),
      unit_price: Math.max(0, n(i.unit_price)),
      unit_cost: Math.max(0, n(i.unit_cost)),
    }));
}

export function itemsTotals(items: Item[], discount = 0, shipping = 0) {
  const subtotal = items.reduce((a, i) => a + i.qty * i.unit_price, 0);
  const cost = items.reduce((a, i) => a + i.qty * i.unit_cost, 0);
  const total = Math.max(0, subtotal - n(discount) + n(shipping));
  return { subtotal, cost, total, units: items.reduce((a, i) => a + i.qty, 0) };
}

/** Diferença em dias entre hoje (YYYY-MM-DD) e a data de entrega. */
export function daysUntil(due: string | null, today: string): number | null {
  if (!due) return null;
  return Math.round((Date.parse(due + "T12:00:00Z") - Date.parse(today + "T12:00:00Z")) / 864e5);
}

/** Pedido atrasado ou perto do prazo (para os alertas). */
export function deadlineInfo(o: Pick<OrderRow, "due_date" | "status">, today: string) {
  if (o.status === "entregue" || o.status === "cancelado") return null;
  const d = daysUntil(o.due_date, today);
  if (d === null) return null;
  if (d < 0) return { level: "atrasado" as const, text: d === -1 ? "Atrasado 1 dia" : `Atrasado ${-d} dias` };
  if (d === 0) return { level: "hoje" as const, text: "Entrega hoje" };
  if (d <= 3) return { level: "breve" as const, text: d === 1 ? "Entrega amanhã" : `Entrega em ${d} dias` };
  return null;
}

/** Consumo de estoque de uma lista de itens (filamento em g, insumos em un). */
export function stockNeeds(
  items: Item[],
  products: { id: string; material_id: string | null; weight_g: number; supplies: { supply_id: string; qty: number }[] }[],
) {
  const materials = new Map<string, number>();
  const supplies = new Map<string, number>();
  for (const it of items) {
    const p = it.product_id ? products.find((x) => x.id === it.product_id) : null;
    if (!p) continue;
    if (p.material_id && p.weight_g > 0) materials.set(p.material_id, (materials.get(p.material_id) ?? 0) + p.weight_g * it.qty);
    for (const s of p.supplies ?? []) supplies.set(s.supply_id, (supplies.get(s.supply_id) ?? 0) + n(s.qty) * it.qty);
  }
  return { materials, supplies };
}

/** Texto do orçamento para colar no WhatsApp. */
export function quoteText(q: Pick<QuoteRow, "number" | "customer_name" | "items" | "discount" | "shipping" | "valid_until" | "delivery_days">, business: string, link?: string) {
  const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const t = itemsTotals(q.items, q.discount, q.shipping);
  const lines = [
    `*${business} — Orçamento nº ${q.number}*`,
    `Olá, ${q.customer_name.split(" ")[0]}! Segue o seu orçamento:`,
    "",
    ...q.items.map((i) => `• ${i.qty}× ${i.description} — ${brl(i.qty * i.unit_price)}`),
    "",
  ];
  if (q.discount > 0) lines.push(`Desconto: -${brl(q.discount)}`);
  if (q.shipping > 0) lines.push(`Frete: ${brl(q.shipping)}`);
  lines.push(`*Total: ${brl(t.total)}*`);
  if (q.delivery_days) lines.push(`Prazo de produção: ${q.delivery_days} dias após a aprovação`);
  if (q.valid_until) {
    const [y, m, d] = q.valid_until.split("-");
    lines.push(`Válido até ${d}/${m}/${y}`);
  }
  if (link) lines.push("", `Veja e aprove aqui: ${link}`);
  return lines.join("\n");
}

/** Link do WhatsApp com a mensagem pronta (número brasileiro ganha o 55). */
export function waLink(phone: string | null, text: string) {
  const digits = (phone ?? "").replace(/\D/g, "");
  const num = digits.length >= 10 && digits.length <= 11 ? "55" + digits : digits;
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}
