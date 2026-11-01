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
  "plan", "plan_name", "product.name", "Product.product_name", "product_name", "offer.name", "offer_name",
  "data.product.name", "data.offer.name", "Subscription.plan.name", "subscription.plan.name",
  "product.id", "product_id", "offer.id", "offer_id", "data.product.id", "Product.product_id",
];
const ID = ["subscription.id", "Subscription.id", "subscription_id", "order_id", "transaction.id", "data.id", "id"];
const PERIOD_END = [
  "subscription.next_payment", "Subscription.charges.future", "next_charge_date", "subscription.charge_date",
  "data.subscription.date_next_charge", "access_until", "expires_at",
];

const ACTIVE = ["approved", "aprovad", "paid", "pago", "complete", "active", "ativ", "renewed", "renovad", "order_approved", "purchase_approved", "subscription_renewed"];
const CANCELED = ["cancel", "expired", "expirad", "inactive", "inativ", "ended", "subscription_canceled"];
const REFUNDED = ["refund", "reembols", "chargeback", "estorn", "dispute"];
const PAST_DUE = ["late", "atrasad", "overdue", "past_due", "delayed", "recusad", "refused"];

export function parseStatus(raw: string | null): Status | null {
  if (!raw) return null;
  const s = raw.toLowerCase();
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

export function parseEvent(payload: unknown, map: Record<string, string> = {}): ParsedEvent | null {
  const email = pick(payload, EMAIL)?.toLowerCase();
  if (!email || !email.includes("@")) return null;
  const productRaw = pick(payload, PRODUCT);
  const end = pick(payload, PERIOD_END);
  const endDate = end && !Number.isNaN(Date.parse(end)) ? new Date(end).toISOString() : null;
  return {
    email,
    plan: parsePlan(productRaw, map),
    status: parseStatus(pick(payload, STATUS)),
    cycle: parseCycle(productRaw),
    externalId: pick(payload, ID),
    periodEnd: endDate,
  };
}
