import { cache } from "react";
import { requireUser } from "@/lib/supabase/server";
import type { PlanId } from "@/lib/plans";

export interface Settings {
  user_id: string;
  business_name: string | null;
  energy_price_kwh: number;
  labor_per_hour: number;
  failure_rate_pct: number;
  default_margin_pct: number;
}
export interface PrinterRow {
  id: string;
  name: string;
  power_watts: number;
  purchase_price: number;
  lifetime_hours: number;
  maintenance_per_hour: number;
}
export interface MaterialRow {
  id: string;
  name: string;
  type: string;
  color: string | null;
  price_per_kg: number;
  stock_g: number;
  min_stock_g: number;
}
export interface SupplyRow {
  id: string;
  name: string;
  unit: string;
  unit_price: number;
  stock_qty: number;
  min_qty: number;
}
export interface ChannelRow {
  id: string;
  name: string;
  fee_pct: number;
  fee_fixed: number;
}
export interface ProductRow {
  id: string;
  name: string;
  category: string | null;
  printer_id: string | null;
  material_id: string | null;
  weight_g: number;
  print_hours: number;
  labor_minutes: number;
  extra_costs: number;
  unit_cost: number;
  sale_price: number;
  notes: string | null;
  supplies: { supply_id: string; qty: number }[];
  stock_qty: number;
  min_qty: number;
}
export interface SaleRow {
  id: string;
  product_id: string | null;
  channel_id: string | null;
  description: string;
  category: string | null;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  fee_pct: number;
  fee_fixed: number;
  shipping_cost: number;
  sold_at: string;
}

/** Supabase devolve numeric como string — converte as colunas conhecidas. */
function nums<T>(rows: Record<string, unknown>[] | null, keys: string[]): T[] {
  return (rows ?? []).map((r) => {
    const o: Record<string, unknown> = { ...r };
    for (const k of keys) if (o[k] != null) o[k] = Number(o[k]);
    return o as T;
  });
}

export const getContext = cache(async () => {
  const { supabase, user } = await requireUser();
  // Liga convites de equipe pendentes para este e-mail (barato: só atualiza se houver).
  await supabase.rpc("accept_invites");
  const [{ data: plan }, { data: profile }, { data: account }, { data: role }] = await Promise.all([
    supabase.rpc("my_plan"),
    supabase.from("profiles").select("name, email, created_at").eq("id", user.id).single(),
    supabase.rpc("account_id"),
    supabase.rpc("my_role"),
  ]);
  return {
    supabase,
    user,
    plan: (plan ?? "nenhum") as PlanId,
    profile,
    /** Conta onde os dados ficam: a do dono da equipe ou a própria. */
    accountId: (account as string | null) ?? user.id,
    role: ((role as string | null) ?? "dono") as "dono" | "membro",
  };
});

export async function getSettings(): Promise<Settings> {
  const { supabase, accountId } = await getContext();
  const { data } = await supabase.from("settings").select("*").eq("user_id", accountId).maybeSingle();
  const [s] = nums<Settings>(data ? [data] : [], [
    "energy_price_kwh",
    "labor_per_hour",
    "failure_rate_pct",
    "default_margin_pct",
  ]);
  return (
    s ?? {
      user_id: accountId,
      business_name: null,
      energy_price_kwh: 0.95,
      labor_per_hour: 20,
      failure_rate_pct: 10,
      default_margin_pct: 50,
    }
  );
}

export async function getPrinters() {
  const { supabase } = await getContext();
  const { data } = await supabase.from("printers").select("*").order("created_at");
  return nums<PrinterRow>(data, ["power_watts", "purchase_price", "lifetime_hours", "maintenance_per_hour"]);
}

export async function getMaterials() {
  const { supabase } = await getContext();
  const { data } = await supabase.from("materials").select("*").order("created_at");
  return nums<MaterialRow>(data, ["price_per_kg", "stock_g", "min_stock_g"]);
}

export async function getChannels() {
  const { supabase } = await getContext();
  const { data } = await supabase.from("channels").select("*").order("created_at");
  return nums<ChannelRow>(data, ["fee_pct", "fee_fixed"]);
}

export async function getProducts() {
  const { supabase } = await getContext();
  const { data } = await supabase.from("products").select("*").order("name");
  return nums<ProductRow>(data, [
    "weight_g",
    "print_hours",
    "labor_minutes",
    "extra_costs",
    "unit_cost",
    "sale_price",
    "stock_qty",
    "min_qty",
  ]);
}

export async function getSales(from?: string, to?: string) {
  const { supabase } = await getContext();
  let q = supabase.from("sales").select("*").order("sold_at", { ascending: false }).order("created_at", { ascending: false });
  if (from) q = q.gte("sold_at", from);
  if (to) q = q.lte("sold_at", to);
  const { data } = await q.limit(2000);
  return nums<SaleRow>(data, ["quantity", "unit_price", "unit_cost", "fee_pct", "fee_fixed", "shipping_cost"]);
}

export async function getSupplies() {
  const { supabase } = await getContext();
  const { data } = await supabase.from("supplies").select("*").order("name");
  return nums<SupplyRow>(data, ["unit_price", "stock_qty", "min_qty"]);
}
