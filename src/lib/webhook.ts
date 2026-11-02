/**
 * Interpretação do webhook da plataforma de vendas (App Digital Hub).
 *
 * Ainda não temos o formato exato do payload, então o parser procura os campos
 * mais comuns em plataformas brasileiras (Kiwify, Hotmart, Cakto, Eduzz…).
 * Todo evento recebido fica salvo em `webhook_events` — com um evento real em
 * mãos, basta ajustar as listas abaixo.
 */

export type Plan = "iniciante" | "profissional" | "empresa";
export type Cycle = "mensal" | "trimestral" | "anual";
export type Status = "active" | "canceled" | "past_due" | "refunded";

export interface ParsedEvent {
  email: string;
  plan: Plan | null;
  /** Códigos de conteúdos extras (order bumps) presentes no pedido. */
  extras: string[];
  status: Status | null;
  cycle: Cycle;
  externalId: string | null;
  periodEnd: string | null;
}

type Json = Record<string, unknown>;

/** Busca o primeiro valor string em qualquer um dos caminhos ("a.b.c"). */
function pick(obj: unknown, paths: string[]): string | null {
  for (const path of paths) {
    let cur: unknown = obj;
    for (const k of path.split(".")) {
      if (cur && typeof cur === "object" && k in (cur as Json)) cur = (cur as Json)[k];
      else {
        cur = undefined;
        break;
      }
    }
    if (typeof cur === "string" && cur.trim()) return cur.trim();
    if (typeof cur === "number") return String(cur);
  }
  return null;
}

const EMAIL = [
  "email", "customer.email", "Customer.email", "buyer.email", "client.email", "user.email",
  "data.customer.email", "data.buyer.email", "data.buyer.email", "data.email", "subscriber.email",
];
const STATUS = [
  "event", "type", "status", "order_status", "webhook_event_type", "data.status", "data.event",
  "subscription.status", "Subscription.status", "transaction.status", "purchase.status", "data.purchase.status",
];
const PRODUCT = [
  "offer.code", "offer.name", "plan", "plan_name", "product.name", "Product.product_name", "product_name", "offer.name", "offer_name",
  "data.product.name", "data.offer.name", "Subscription.plan.name", "subscription.plan.name",
  "product.id", "product_id", "offer.id", "offer_id", "data.product.id", "Product.product_id",
];
const ID = ["subscription.id", "Subscription.id", "subscription_id", "order_id", "transaction.id", "data.id", "id"];
const PERIOD_END = [
  "subscription.current_period_end", "subscription.next_payment", "Subscription.charges.future", "next_charge_date", "subscription.charge_date",
  "data.subscription.date_next_charge", "access_until", "expires_at",
];

const ACTIVE = ["approved", "aprovad", "paid", "pago", "complete", "active", "ativ", "renewed", "renovad", "order_approved", "purchase_approved", "subscription_renewed"];
const CANCELED = ["cancel", "expired", "expirad", "inactive", "inativ", "ended", "subscription_canceled"];
const REFUNDED = ["refund", "reembols", "chargeback", "estorn", "dispute"];
const PAST_DUE = ["late", "atrasad", "overdue", "past_due", "delayed"];
// Pagamento recusado ou pendente não muda nada (não libera nem bloqueia).
const IGNORE = ["recusad", "refused", "pendente", "pending", "waiting"];

export function parseStatus(raw: string | null): Status | null {
  if (!raw) return null;
  const s = raw.toLowerCase();
  if (IGNORE.some((k) => s.includes(k))) return null;
  if (REFUNDED.some((k) => s.includes(k))) return "refunded";
  if (CANCELED.some((k) => s.includes(k))) return "canceled";
  if (PAST_DUE.some((k) => s.includes(k))) return "past_due";
  if (ACTIVE.some((k) => s.includes(k))) return "active";
  return null;
}

export function parsePlan(raw: string | null, map: Record<string, string> = {}): Plan | null {
  if (!raw) return null;
  if (map[raw]) return map[raw] as Plan;
  const s = raw.toLowerCase();
  if (s.includes("empresa") || s.includes("business")) return "empresa";
  if (s.includes("iniciante") || s.includes("starter") || s.includes("basic")) return "iniciante";
  if (s.includes("profissional") || /\bpro\b/.test(s)) return "profissional";
  return null;
}

export function parseCycle(raw: string | null): Cycle {
  const s = (raw ?? "").toLowerCase();
  if (s.includes("anual") || s.includes("annual") || s.includes("yearly") || s.includes("12 meses")) return "anual";
  if (s.includes("trimestr") || s.includes("quarter") || s.includes("3 meses")) return "trimestral";
  return "mensal";
}

export function addCycle(from: Date, cycle: Cycle): Date {
  const d = new Date(from);
  d.setUTCMonth(d.getUTCMonth() + (cycle === "anual" ? 12 : cycle === "trimestral" ? 3 : 1));
  d.setUTCDate(d.getUTCDate() + 2); // folga para a renovação chegar
  return d;
}

const EXTRA_CODES = ["bump_mockups", "bump_etiquetas", "bump_mensagens", "bump_guia"];

/** Identifica um order bump pelo mapa (ID/nome → código) ou por palavras do nome. */
/** Combo "leve todos": libera todos os materiais extras de uma vez. */
export function isCombo(raw: string | null): boolean {
  if (!raw) return false;
  const s = raw.toLowerCase();
  return s.includes("combo") || s.includes("leve todos") || s.includes("todos os materiais") || s.includes("kit completo");
}

/** Extras liberados por um item do pedido (o combo libera todos). */
export function parseExtras(raw: string | null, map: Record<string, string> = {}): string[] {
  if (isCombo(raw)) return [...EXTRA_CODES];
  const one = parseExtra(raw, map);
  return one ? [one] : [];
}

export function parseExtra(raw: string | null, map: Record<string, string> = {}): string | null {
  if (!raw) return null;
  if (isCombo(raw)) return null;
  if (map[raw] && EXTRA_CODES.includes(map[raw])) return map[raw];
  const s = raw.toLowerCase();
  if (s.includes("mockup")) return "bump_mockups";
  if (s.includes("etiqueta") || s.includes("embalage")) return "bump_etiquetas";
  if (s.includes("mensage") || s.includes("modelos de anúncio") || s.includes("modelos de anuncio")) return "bump_mensagens";
  if (s.includes("guia") && (s.includes("mercado") || s.includes("shopee"))) return "bump_guia";
  return null;
}

const ITEM_ARRAYS = ["order.bumps", "bumps", "items", "products", "order_items", "line_items", "data.items", "data.products", "order.items", "Order.items", "Products"];
const ITEM_FIELDS = ["name", "product_name", "title", "offer_name", "product.name", "product_id", "offer_id", "id"];

/** Todos os produtos do pedido: o principal + itens de listas (order bumps). */
function productNames(payload: unknown): string[] {
  const out = new Set<string>();
  for (const p of ["offer.code", "offer.name", "product.name", "product.id"]) {
    const v = pick(payload, [p]);
    if (v) out.add(v);
  }
  const main = pick(payload, PRODUCT);
  if (main) out.add(main);
  for (const path of ITEM_ARRAYS) {
    let cur: unknown = payload;
    for (const k of path.split(".")) cur = cur && typeof cur === "object" ? (cur as Json)[k] : undefined;
    if (Array.isArray(cur)) {
      for (const it of cur) {
        for (const f of ITEM_FIELDS) {
          const v = pick(it, [f]);
          if (v) out.add(v);
        }
      }
    }
  }
  return [...out];
}

/** Ciclo pelo campo estruturado da oferta (Digital Hub: offer.interval / interval_count). */
function structuredCycle(payload: unknown): Cycle | null {
  const interval = pick(payload, ["offer.interval"]);
  const count = Number(pick(payload, ["offer.interval_count"]) ?? 1);
  if (interval === "year") return "anual";
  if (interval === "month") return count >= 12 ? "anual" : count >= 3 ? "trimestral" : "mensal";
  return null;
}

export function parseEvent(payload: unknown, map: Record<string, string> = {}): ParsedEvent | null {
  const email = pick(payload, EMAIL)?.toLowerCase();
  if (!email || !email.includes("@")) return null;
  const names = productNames(payload);
  const extras = [...new Set(names.flatMap((n) => parseExtras(n, map)))];
  const planName = names.find((n) => parseExtras(n, map).length === 0 && parsePlan(n, map)) ?? null;
  const productRaw = planName ?? pick(payload, PRODUCT);
  const end = pick(payload, PERIOD_END);
  const endDate = end && !Number.isNaN(Date.parse(end)) ? new Date(end).toISOString() : null;
  return {
    email,
    plan: productRaw && parseExtras(productRaw, map).length === 0 ? parsePlan(productRaw, map) : null,
    extras,
    status: parseStatus(pick(payload, STATUS)),
    cycle: structuredCycle(payload) ?? parseCycle(names.join(" ")),
    externalId: pick(payload, ID),
    periodEnd: endDate,
  };
}
