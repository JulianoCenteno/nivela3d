import { getContext } from "@/lib/data";
import { cleanItems, type OrderRow, type QuoteRow } from "@/lib/orders";

const num = (v: unknown) => Number(v) || 0;

function toQuote(r: Record<string, unknown>): QuoteRow {
  return { ...(r as unknown as QuoteRow), number: num(r.number), items: cleanItems(r.items), discount: num(r.discount), shipping: num(r.shipping) };
}
function toOrder(r: Record<string, unknown>): OrderRow {
  return {
    ...(r as unknown as OrderRow),
    number: num(r.number),
    items: cleanItems(r.items),
    discount: num(r.discount),
    shipping: num(r.shipping),
    shipping_cost: num(r.shipping_cost),
  };
}

export async function getQuotes() {
  const { supabase } = await getContext();
  const { data } = await supabase.from("quotes").select("*").order("created_at", { ascending: false }).limit(300);
  return (data ?? []).map(toQuote);
}
export async function getQuote(id: string) {
  const { supabase } = await getContext();
  const { data } = await supabase.from("quotes").select("*").eq("id", id).maybeSingle();
  return data ? toQuote(data) : null;
}
export async function getOrders() {
  const { supabase } = await getContext();
  const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(500);
  return (data ?? []).map(toOrder);
}
export async function getOrder(id: string) {
  const { supabase } = await getContext();
  const { data } = await supabase.from("orders").select("*").eq("id", id).maybeSingle();
  return data ? toOrder(data) : null;
}

export interface MemberRow {
  id: string;
  email: string;
  name: string | null;
  member_id: string | null;
  status: "pendente" | "ativo";
  created_at: string;
}
export async function getTeam() {
  const { supabase, accountId } = await getContext();
  const { data } = await supabase.from("team_members").select("*").eq("owner_id", accountId).order("created_at");
  return (data ?? []) as MemberRow[];
}

/** Pessoas para atribuir pedidos: dono + membros ativos. */
export async function getPeople() {
  const { supabase, accountId } = await getContext();
  const [{ data: owner }, { data: team }] = await Promise.all([
    supabase.from("profiles").select("id, name, email").eq("id", accountId).maybeSingle(),
    supabase.from("team_members").select("member_id, name, email").eq("owner_id", accountId).eq("status", "ativo"),
  ]);
  const people: { id: string; name: string }[] = [];
  if (owner) people.push({ id: owner.id, name: owner.name || owner.email });
  for (const t of team ?? []) if (t.member_id) people.push({ id: t.member_id, name: t.name || t.email });
  return people;
}

export async function getMovements(limit = 30) {
  const { supabase } = await getContext();
  const { data } = await supabase.from("stock_movements").select("*").order("created_at", { ascending: false }).limit(limit);
  return (data ?? []).map((m) => ({ ...m, qty: num(m.qty) })) as {
    id: string;
    item_type: "material" | "supply" | "product";
    item_name: string;
    qty: number;
    reason: string;
    created_at: string;
  }[];
}
