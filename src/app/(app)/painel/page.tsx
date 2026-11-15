import { requireOwner } from "@/lib/guard";
import { AlarmClock, AlertTriangle, Bot, Calculator, Check, CircleDollarSign, Coins, CreditCard, Package, Plus, Printer, Receipt, Settings, Spool, Target, Wallet } from "lucide-react";
import { DailyBars, Delta, Donut, Kpi, Progress } from "@/components/finance";
import { NivoButton } from "@/components/Nivo";
import { CATEGORY_COLOR, change, dailyRevenue, expensesByCategory, goalProgress, summarize } from "@/lib/finance";
import Link from "next/link";
import { MonthNav } from "@/components/MonthNav";
import { PageHeader } from "@/components/ui";
import { saleTotals } from "@/lib/calc";
import { getContext, getExpenses, getMaterials, getPrinters, getProducts, getSales, getSettings, getSupplies } from "@/lib/data";
import { getOrders } from "@/lib/gestao-data";
import { deadlineInfo, deadlineText } from "@/lib/orders";
import { hasFeature } from "@/lib/plans";
import { monthRange, shiftMonth, todayISO } from "@/lib/period";
import { getI18n, getT } from "@/i18n/server";
import { LOCALE_TAG } from "@/i18n/config";

export async function generateMetadata() {
  return { title: (await getT()).money.dash.title };
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  await requireOwner();
  const sp = await searchParams;
  const { t: tt, fmt, locale } = await getI18n();
  const d_ = tt.money.dash;
  const { money, number, pct } = fmt;
  const period = monthRange(sp.mes, LOCALE_TAG[locale]);
  const prevP = monthRange(shiftMonth(period.ym, -1), LOCALE_TAG[locale]);
  const [{ profile }, sales, printers, materials, products, settings, expenses, prevSales, prevExpenses] = await Promise.all([
    getContext(),
    getSales(period.from, period.to),
    getPrinters(),
    getMaterials(),
    getProducts(),
    getSettings(),
    getExpenses(period.from, period.to),
    getSales(prevP.from, prevP.to),
    getExpenses(prevP.from, prevP.to),
  ]);
  const fd = tt.finance.dash;
  const S = summarize(sales, expenses);
  const P = summarize(prevSales, prevExpenses);
  const days = dailyRevenue(sales, period.from, period.to);
  const split = expensesByCategory(expenses);
  const goal = goalProgress(S.revenue, settings.goal_revenue, todayISO(), period.from, period.to);
  const dpct = (v: number) => pct(Math.round(v));

  const rows = sales.map((s) => ({
    ...s,
    t: saleTotals({
      quantity: s.quantity,
      unitPrice: s.unit_price,
      unitCost: s.unit_cost,
      feePct: s.fee_pct,
      feeFixed: s.fee_fixed,
      shippingCost: s.shipping_cost,
    }),
  }));
  const sum = rows.reduce(
    (a, r) => ({
      revenue: a.revenue + r.t.revenue,
      fees: a.fees + r.t.fees,
      cost: a.cost + r.t.cost,
      profit: a.profit + r.t.profit,
      units: a.units + r.quantity,
    }),
    { revenue: 0, fees: 0, cost: 0, profit: 0, units: 0 },
  );

  // Lucro por categoria
  const byCat = new Map<string, number>();
  for (const r of rows) byCat.set(r.category || d_.noCategory, (byCat.get(r.category || d_.noCategory) ?? 0) + r.t.profit);
  const cats = [...byCat.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  const maxCat = Math.max(1, ...cats.map(([, v]) => Math.abs(v)));

  // Produtos que mais deram lucro
  const byProd = new Map<string, { name: string; profit: number; units: number }>();
  for (const r of rows) {
    const k = r.product_id ?? r.description;
    const cur = byProd.get(k) ?? { name: r.description, profit: 0, units: 0 };
    cur.profit += r.t.profit;
    cur.units += r.quantity;
    byProd.set(k, cur);
  }
  const top = [...byProd.values()].sort((a, b) => b.profit - a.profit).slice(0, 5);

  const steps = [
    { done: settings.energy_price_kwh !== 0.95 || settings.labor_per_hour !== 20, label: d_.steps.costs, href: "/configuracoes", icon: Settings },
    { done: printers.length > 0, label: d_.steps.printer, href: "/impressoras", icon: Printer },
    { done: materials.length > 0, label: d_.steps.filament, href: "/materiais", icon: Spool },
    { done: products.length > 0, label: d_.steps.product, href: "/produtos/novo", icon: Package },
    { done: sales.length > 0, label: d_.steps.sale, href: "/vendas", icon: Receipt },
    { done: expenses.length > 0 || prevExpenses.length > 0, label: d_.steps.expense, href: "/despesas", icon: Wallet },
    { done: settings.goal_revenue > 0, label: d_.steps.goal, href: "/metas", icon: Target },
  ];
  const pending = steps.filter((s) => !s.done).length;

  // Alertas (automação do plano Empresa): prazos e estoque baixo
  const ctx = await getContext();
  const auto = hasFeature(ctx.plan, "automacoes");
  const today = todayISO();
  const [orders, supplies] = auto ? await Promise.all([getOrders(), getSupplies()]) : [[], []];
  const late = orders.map((o) => ({ o, d: deadlineInfo(o, today) })).filter((x) => x.d);
  const lowStock = auto
    ? [
        ...materials.filter((m) => (m.min_stock_g > 0 && m.stock_g <= m.min_stock_g) || m.stock_g < 0).map((m) => m.name),
        ...supplies.filter((s) => (s.min_qty > 0 && s.stock_qty <= s.min_qty) || s.stock_qty < 0).map((s) => s.name),
      ]
    : [];
  const first = (profile?.name || "").split(" ")[0];

  return (
    <>
      <PageHeader
        title={first ? d_.hello(first) : d_.title}
        description={d_.desc}
        action={<MonthNav base="/painel" ym={period.ym} label={period.label} />}
      />

      {(late.length > 0 || lowStock.length > 0) && (
        <section className="mb-8 grid gap-4 md:grid-cols-2">
          {late.length > 0 && (
            <Link href="/pedidos" className="block rounded-2xl border border-[#E8C9A8] bg-[#FBF1E6] p-5 hover:border-[#d9a77a] dark:border-[#5a4632] dark:bg-[#2b241c]">
              <p className="flex items-center gap-2 font-bold"><AlarmClock size={18} /> {d_.deadlines}</p>
              <ul className="mt-2 space-y-1 text-[15px]">
                {late.slice(0, 4).map(({ o, d }) => (
                  <li key={o.id}><b className={d!.level === "atrasado" ? "text-negative" : ""}>{deadlineText(d!, tt.gestao.deadline)}</b> · {tt.ops.quotes.num(o.number)} · {o.customer_name}</li>
                ))}
              </ul>
            </Link>
          )}
          {lowStock.length > 0 && (
            <Link href="/estoque" className="block rounded-2xl bg-negative-soft p-5 text-negative">
              <p className="flex items-center gap-2 font-bold"><AlertTriangle size={18} /> {d_.lowStock}</p>
              <p className="mt-2 text-[15px]">{lowStock.slice(0, 6).join(" · ")}</p>
            </Link>
          )}
        </section>
      )}

      {pending > 0 && (
        <section className="card mb-8 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">{d_.firstSteps}</h2>
            <span className="text-sm font-semibold text-muted">{d_.of(steps.length - pending, steps.length)}</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-primary" style={{ width: `${((steps.length - pending) / steps.length) * 100}%` }} />
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {steps.map(({ done, label, href, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={`flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-[15px] font-semibold transition hover:border-primary ${done ? "text-muted line-through" : ""}`}
                >
                  <span className={`rounded-lg p-1.5 ${done ? "bg-primary text-on-primary" : "bg-primary-soft text-primary"}`}>
                    {done ? <Check size={16} /> : <Icon size={16} />}
                  </span>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Kpi highlight icon={<CircleDollarSign size={20} />} label={d_.revenue} value={money(S.revenue)} delta={<Delta value={change(S.revenue, P.revenue)} fmtPct={dpct} />} hint={d_.pieces(number(S.units))} />
        <Kpi icon={<Coins size={20} />} label={fd.netProfit} value={money(S.netProfit)} tone={S.netProfit < 0 ? "negative" : S.netProfit > 0 ? "positive" : undefined} delta={<Delta value={change(S.netProfit, P.netProfit)} fmtPct={dpct} />} hint={S.revenue > 0 ? d_.margin(pct(Math.round(S.marginPct))) : undefined} />
        <Kpi icon={<CreditCard size={20} />} label={fd.expenses} value={money(S.cost + S.fees + S.expenses)} delta={<Delta value={change(S.cost + S.fees + S.expenses, P.cost + P.fees + P.expenses)} fmtPct={dpct} invert />} />
        <Kpi icon={<Target size={20} />} label={fd.roi} value={`${number(Math.round(S.roi * 100) / 100)}x`} delta={<Delta value={change(S.roi, P.roi)} fmtPct={dpct} />} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <section className="card p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold">{fd.evolution}</h2>
            <div className="flex gap-2">
              <Link href="/vendas" className="btn-ghost inline-flex items-center gap-1 px-3 py-1.5 text-sm"><Plus size={14} /> {fd.newSale}</Link>
              <Link href="/despesas" className="btn-ghost inline-flex items-center gap-1 px-3 py-1.5 text-sm"><Plus size={14} /> {fd.newExpense}</Link>
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div><dt className="text-muted">{fd.orders}</dt><dd className="tnum text-lg font-extrabold">{S.orders}</dd></div>
            <div><dt className="text-muted">{fd.ticket}</dt><dd className="tnum text-lg font-extrabold">{money(S.orders ? S.revenue / S.orders : 0)}</dd></div>
            <div><dt className="text-muted">{fd.margin}</dt><dd className={`tnum text-lg font-extrabold ${S.marginPct < 0 ? "text-negative" : "text-positive"}`}>{pct(Math.round(S.marginPct * 10) / 10)}</dd></div>
          </dl>
          <div className="mt-5">
            <DailyBars days={days} fmtMoney={money} fmtDay={(iso) => (iso ? fmt.short(iso).slice(0, 5) : "")} />
          </div>
        </section>

        <div className="space-y-6">
          <section className="card p-6">
            <h2 className="font-bold">{fd.expenseSplit}</h2>
            <div className="mt-4 flex items-center gap-5">
              <Donut size={130} parts={split.map(([c, v]) => ({ label: tt.finance.cat[c], value: v, color: CATEGORY_COLOR[c] }))} center={money(S.expenses)} sub={fd.total} />
              {split.length === 0 ? (
                <p className="text-sm text-muted">{tt.finance.expenses.empty}</p>
              ) : (
                <ul className="flex-1 space-y-1.5 text-sm">
                  {split.slice(0, 5).map(([c, v]) => (
                    <li key={c} className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ background: CATEGORY_COLOR[c] }} />
                      <span className="flex-1 truncate text-ink-2">{tt.finance.cat[c]}</span>
                      <span className="tnum font-semibold">{pct(Math.round((v / (S.expenses || 1)) * 100))}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section className="card p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">{fd.goal}</h2>
              <Link href="/metas" className="text-sm font-semibold text-primary hover:underline">{settings.goal_revenue > 0 ? tt.finance.goals.edit : fd.setGoal}</Link>
            </div>
            {settings.goal_revenue > 0 ? (
              <>
                <p className="mt-3 text-sm"><span className="tnum text-xl font-extrabold">{money(S.revenue)}</span> <span className="text-muted">{tt.finance.goals.of(money(settings.goal_revenue))}</span></p>
                <div className="mt-2"><Progress pct={goal.pct} /></div>
                <p className="mt-3 rounded-xl bg-primary-soft p-3 text-sm text-ink-2">{goal.left <= 0 ? fd.goalDone : fd.goalLeft(money(goal.left), money(goal.perDay), goal.daysLeft)}</p>
              </>
            ) : (
              <p className="mt-3 text-sm text-muted">{fd.noGoal}</p>
            )}
          </section>

          <NivoButton className="flex w-full items-center gap-3 rounded-2xl bg-primary p-4 text-left text-on-primary transition hover:bg-primary-hover">
            <span className="rounded-xl bg-white/15 p-2"><Bot size={20} /></span>
            <span>
              <span className="block font-bold">{fd.askNivo}</span>
              <span className="block text-xs text-on-primary/80">{tt.finance.nivo.chips[0]} · {tt.finance.nivo.chips[1]}</span>
            </span>
          </NivoButton>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center px-6 py-12 text-center">
          <Calculator size={28} className="text-sage" />
          <p className="mt-3 font-bold">{d_.noSales(period.label)}</p>
          <p className="mt-1 max-w-sm text-muted">{d_.noSalesText}</p>
          <Link href="/vendas" className="btn-primary mt-5">{d_.logSale}</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="card p-6">
            <h2 className="font-bold">{d_.byCategory}</h2>
            <ul className="mt-5 space-y-4">
              {cats.map(([name, v]) => (
                <li key={name} title={`${name}: ${money(v)}`}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-semibold text-ink-2">{name}</span>
                    <span className="tnum font-bold">{money(v)}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-surface-2">
                    <div
                      className={`h-full rounded-full ${v < 0 ? "bg-negative" : "bg-sage"}`}
                      style={{ width: `${Math.max(2, (Math.abs(v) / maxCat) * 100)}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="card p-6">
            <h2 className="font-bold">{d_.topProducts}</h2>
            <ol className="mt-4 divide-y divide-line">
              {top.map((p, i) => (
                <li key={p.name + i} className="flex items-center gap-3 py-3">
                  <span className="tnum w-6 text-sm font-bold text-muted">{i + 1}</span>
                  <span className="flex-1 font-semibold">{p.name}</span>
                  <span className="tnum hidden text-sm text-muted sm:inline">{d_.units(p.units)}</span>
                  <span className={`tnum shrink-0 text-right font-bold ${p.profit < 0 ? "text-negative" : ""}`}>{money(p.profit)}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="card p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">{d_.lastSales}</h2>
              <Link href={`/vendas?mes=${period.ym}`} className="text-sm font-semibold text-primary hover:underline">{d_.seeAll}</Link>
            </div>
            <ul className="mt-3 divide-y divide-line">
              {rows.slice(0, 6).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-semibold">{r.quantity > 1 ? `${r.quantity}× ` : ""}{r.description}</p>
                    <p className="text-sm text-muted">{fmt.short(r.sold_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="tnum font-semibold">{money(r.t.revenue)}</p>
                    <p className={`tnum text-sm ${r.t.profit < 0 ? "text-negative" : "text-positive"}`}>{d_.profitOf(money(r.t.profit))}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </>
  );
}
