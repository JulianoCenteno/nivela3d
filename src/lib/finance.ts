import { saleTotals } from "./calc";
import type { ExpenseRow, SaleRow } from "./data";

/** Categorias de despesa (as chaves ficam no banco; os nomes vêm do dicionário). */
export const EXPENSE_CATEGORIES = ["filamento", "energia", "anuncios", "taxas", "manutencao", "embalagem", "frete", "equipamento", "outros"] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export const isExpenseCategory = (v: unknown): v is ExpenseCategory =>
  typeof v === "string" && (EXPENSE_CATEGORIES as readonly string[]).includes(v);

/** Cores das categorias no gráfico de rosca. */
export const CATEGORY_COLOR: Record<ExpenseCategory, string> = {
  filamento: "#2F6B5A",
  energia: "#D69E2E",
  anuncios: "#6B5BD6",
  taxas: "#2B9DB0",
  manutencao: "#C2563B",
  embalagem: "#8A9A5B",
  frete: "#5B7FA6",
  equipamento: "#9C6B98",
  outros: "#9AA3A0",
};

export interface Summary {
  revenue: number;
  fees: number;
  /** Custo de produção das peças vendidas (+ frete pago pelo vendedor). */
  cost: number;
  /** Lucro das vendas (faturamento − taxas − custo). */
  grossProfit: number;
  expenses: number;
  /** Lucro depois das despesas do negócio. */
  netProfit: number;
  marginPct: number;
  /** Quanto volta para cada real gasto (lucro líquido ÷ custos totais). */
  roi: number;
  orders: number;
  units: number;
}

export function totalsOf(s: SaleRow) {
  return saleTotals({
    quantity: s.quantity,
    unitPrice: s.unit_price,
    unitCost: s.unit_cost,
    feePct: s.fee_pct,
    feeFixed: s.fee_fixed,
    shippingCost: s.shipping_cost,
  });
}

export function summarize(sales: SaleRow[], expenses: ExpenseRow[]): Summary {
  let revenue = 0, fees = 0, cost = 0, units = 0;
  for (const s of sales) {
    const t = totalsOf(s);
    revenue += t.revenue;
    fees += t.fees;
    cost += t.cost;
    units += s.quantity;
  }
  const exp = expenses.reduce((a, e) => a + e.amount, 0);
  const grossProfit = revenue - fees - cost;
  const netProfit = grossProfit - exp;
  const spent = fees + cost + exp;
  return {
    revenue,
    fees,
    cost,
    grossProfit,
    expenses: exp,
    netProfit,
    marginPct: revenue > 0 ? (netProfit / revenue) * 100 : 0,
    roi: spent > 0 ? netProfit / spent : 0,
    orders: sales.length,
    units,
  };
}

/** Variação percentual entre dois valores (null quando não dá para comparar). */
export function change(cur: number, prev: number): number | null {
  if (!prev) return cur ? null : 0;
  return ((cur - prev) / Math.abs(prev)) * 100;
}

/** Faturamento por dia do mês (para o gráfico de evolução). */
export function dailyRevenue(sales: SaleRow[], from: string, to: string) {
  const days: { date: string; revenue: number; profit: number }[] = [];
  const start = new Date(from + "T12:00:00Z");
  const end = new Date(to + "T12:00:00Z");
  for (let d = start; d <= end; d = new Date(d.getTime() + 864e5)) days.push({ date: d.toISOString().slice(0, 10), revenue: 0, profit: 0 });
  const idx = new Map(days.map((d, i) => [d.date, i]));
  for (const s of sales) {
    const i = idx.get(s.sold_at);
    if (i === undefined) continue;
    const t = totalsOf(s);
    days[i].revenue += t.revenue;
    days[i].profit += t.profit;
  }
  return days;
}

export function expensesByCategory(expenses: ExpenseRow[]) {
  const m = new Map<ExpenseCategory, number>();
  for (const e of expenses) {
    const c = isExpenseCategory(e.category) ? e.category : "outros";
    m.set(c, (m.get(c) ?? 0) + e.amount);
  }
  return [...m.entries()].sort((a, b) => b[1] - a[1]);
}

/** Projeção para o fim do mês e quanto falta por dia para bater a meta. */
export function goalProgress(current: number, goal: number, today: string, monthFrom: string, monthTo: string) {
  const lastDay = Number(monthTo.slice(8, 10));
  const inMonth = today >= monthFrom && today <= monthTo;
  const isPast = today > monthTo;
  const day = inMonth ? Number(today.slice(8, 10)) : isPast ? lastDay : 0;
  const projection = day > 0 ? (current / day) * lastDay : current;
  const left = Math.max(0, goal - current);
  const daysLeft = inMonth ? lastDay - day + 1 : isPast ? 0 : lastDay;
  return {
    pct: goal > 0 ? Math.min(100, (current / goal) * 100) : 0,
    projection,
    projectionPct: goal > 0 ? (projection / goal) * 100 : 0,
    left,
    perDay: daysLeft > 0 ? left / daysLeft : 0,
    daysLeft,
  };
}
