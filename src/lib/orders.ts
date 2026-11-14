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

export const QUOTE_TONE: Record<QuoteStatus, string> = {
  aberto: "bg-surface-2 text-ink-2",
  enviado: "bg-sand-soft text-ink-2",
  aprovado: "bg-primary-soft text-primary",
  recusado: "bg-negative-soft text-negative",
  convertido: "bg-primary-soft text-primary",
};

export const ORDER_TONE: Record<OrderStatus, string> = {
  novo: "bg-sand-soft text-ink-2",
  producao: "bg-primary-soft text-primary",
  pronto: "bg-primary-soft text-primary",
  entregue: "bg-surface-2 text-muted",
  cancelado: "bg-negative-soft text-negative",
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
  if (d < 0) return { level: "atrasado" as const, days: -d };
  if (d === 0) return { level: "hoje" as const, days: 0 };
  if (d <= 3) return { level: "breve" as const, days: d };
  return null;
}

type DeadlineDict = { late: (d: number) => string; today: string; soon: (d: number) => string };
export function deadlineText(info: { level: "atrasado" | "hoje" | "breve"; days: number }, t: DeadlineDict) {
  return info.level === "atrasado" ? t.late(info.days) : info.level === "hoje" ? t.today : t.soon(info.days);
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
type QuoteTextDict = {
  title: (business: string, n: number) => string;
  hello: (name: string) => string;
  discount: string;
  shipping: string;
  total: string;
  leadTime: (d: number) => string;
  validUntil: (date: string) => string;
  approveHere: (link: string) => string;
};

export function quoteText(
  q: Pick<QuoteRow, "number" | "customer_name" | "items" | "discount" | "shipping" | "valid_until" | "delivery_days">,
  business: string,
  link: string | undefined,
  tx: QuoteTextDict,
  money: (v: number) => string,
  shortDate: (iso: string) => string,
) {
  const t = itemsTotals(q.items, q.discount, q.shipping);
  const lines = [
    tx.title(business, q.number),
    tx.hello(q.customer_name.split(" ")[0]),
    "",
    ...q.items.map((i) => `• ${i.qty}× ${i.description} — ${money(i.qty * i.unit_price)}`),
    "",
  ];
  if (q.discount > 0) lines.push(`${tx.discount}: -${money(q.discount)}`);
  if (q.shipping > 0) lines.push(`${tx.shipping}: ${money(q.shipping)}`);
  lines.push(`*${tx.total}: ${money(t.total)}*`);
  if (q.delivery_days) lines.push(tx.leadTime(q.delivery_days));
  if (q.valid_until) lines.push(tx.validUntil(shortDate(q.valid_until)));
  if (link) lines.push("", tx.approveHere(link));
  return lines.join("\n");
}

/** Link do WhatsApp com a mensagem pronta (número brasileiro ganha o 55). */
export function waLink(phone: string | null, text: string) {
  const digits = (phone ?? "").replace(/\D/g, "");
  const num = digits.length >= 10 && digits.length <= 11 ? "55" + digits : digits;
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}
