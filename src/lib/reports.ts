import "server-only";
import { getChannels, getExpenses, getSales } from "./data";
import { summarize, totalsOf, type Summary } from "./finance";
import { monthRange, shiftMonth } from "./period";

/** Resumo dos últimos `months` meses (o mais recente primeiro), produtos e canais do mês escolhido. */
export async function buildReport(ym: string, tag: string, months = 6) {
  const period = monthRange(ym, tag);
  const from = monthRange(shiftMonth(period.ym, -(months - 1)), tag).from;
  const [sales, expenses, channels] = await Promise.all([getSales(from, period.to), getExpenses(from, period.to), getChannels()]);
  const within = (d: string, a: string, b: string) => d >= a && d <= b;

  const monthly: { ym: string; label: string; s: Summary }[] = Array.from({ length: months }, (_, i) => {
    const r = monthRange(shiftMonth(period.ym, -i), tag);
    return {
      ym: r.ym,
      label: r.label,
      s: summarize(
        sales.filter((x) => within(x.sold_at, r.from, r.to)),
        expenses.filter((x) => within(x.spent_at, r.from, r.to)),
      ),
    };
  });

  const cur = sales.filter((x) => within(x.sold_at, period.from, period.to));
  const prod = new Map<string, { name: string; qty: number; revenue: number; profit: number }>();
  const chan = new Map<string, { name: string | null; orders: number; revenue: number }>();
  const chName = new Map(channels.map((c) => [c.id, c.name]));
  for (const s of cur) {
    const t = totalsOf(s);
    const k = s.product_id ?? s.description;
    const p = prod.get(k) ?? { name: s.description, qty: 0, revenue: 0, profit: 0 };
    p.qty += s.quantity;
    p.revenue += t.revenue;
    p.profit += t.profit;
    prod.set(k, p);
    const ck = s.channel_id ?? "";
    const c = chan.get(ck) ?? { name: s.channel_id ? chName.get(s.channel_id) ?? null : null, orders: 0, revenue: 0 };
    c.orders += 1;
    c.revenue += t.revenue;
    chan.set(ck, c);
  }
  return {
    period,
    monthly,
    products: [...prod.values()].sort((a, b) => b.profit - a.profit),
    channels: [...chan.values()].sort((a, b) => b.revenue - a.revenue),
  };
}
