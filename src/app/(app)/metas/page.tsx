import { PartyPopper, Rocket, Target, TrendingUp } from "lucide-react";
import { Progress } from "@/components/finance";
import { MonthNav } from "@/components/MonthNav";
import { SubmitButton } from "@/components/SubmitButton";
import { Flash, PageHeader } from "@/components/ui";
import { getExpenses, getSales, getSettings } from "@/lib/data";
import { goalProgress, summarize } from "@/lib/finance";
import { requireOwner } from "@/lib/guard";
import { monthRange, shiftMonth, todayISO } from "@/lib/period";
import { getI18n, getT } from "@/i18n/server";
import { LOCALE_TAG } from "@/i18n/config";
import { saveGoals } from "../finance-actions";

export async function generateMetadata() {
  return { title: (await getT()).finance.goals.title };
}

export default async function GoalsPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string; mes?: string }> }) {
  await requireOwner();
  const sp = await searchParams;
  const { t, fmt, locale } = await getI18n();
  const g = t.finance.goals;
  const tag = LOCALE_TAG[locale];
  const period = monthRange(sp.mes, tag);
  const histFrom = monthRange(shiftMonth(period.ym, -5), tag).from;
  const [settings, sales, expenses] = await Promise.all([getSettings(), getSales(histFrom, period.to), getExpenses(histFrom, period.to)]);
  const today = todayISO();

  const inMonth = (d: string, from: string, to: string) => d >= from && d <= to;
  const cur = summarize(
    sales.filter((s) => inMonth(s.sold_at, period.from, period.to)),
    expenses.filter((e) => inMonth(e.spent_at, period.from, period.to)),
  );
  const shortMonth = period.label.split(" ")[0];

  const cards = [
    { title: g.revenue(shortMonth), current: cur.revenue, goal: settings.goal_revenue, tone: "primary" as const },
    { title: g.profit(shortMonth), current: cur.netProfit, goal: settings.goal_profit, tone: "positive" as const },
  ];

  const history = Array.from({ length: 6 }, (_, i) => {
    const r = monthRange(shiftMonth(period.ym, -i), tag);
    const s = summarize(
      sales.filter((x) => inMonth(x.sold_at, r.from, r.to)),
      [],
    );
    return { label: r.label, revenue: s.revenue };
  });

  return (
    <>
      <PageHeader title={g.title} description={g.desc} action={<MonthNav base="/metas" ym={period.ym} label={period.label} />} />
      <Flash ok={sp.ok} erro={sp.erro} />

      <div className="grid gap-6 lg:grid-cols-2">
        {cards.map((c) => {
          const p = goalProgress(c.current, c.goal, today, period.from, period.to);
          const reached = c.goal > 0 && c.current >= c.goal;
          const good = p.projectionPct >= 100;
          return (
            <section key={c.title} className="card p-6">
              <h2 className="flex items-center gap-2 font-bold">
                <Target size={18} className="text-primary" /> {c.title}
              </h2>
              <p className="mt-4">
                <span className="tnum text-3xl font-extrabold tracking-tight">{fmt.money(c.current)}</span>{" "}
                {c.goal > 0 && <span className="text-sm text-muted">{g.of(fmt.money(c.goal))}</span>}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex-1">
                  <Progress pct={p.pct} tone={c.tone} />
                </div>
                <span className="tnum text-sm font-bold">{fmt.pct(Math.round(p.pct))}</span>
              </div>
              {c.goal > 0 ? (
                <>
                  <dl className="mt-5 grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <dt className="text-muted">{g.projection}</dt>
                      <dd className="tnum mt-0.5 font-bold">{fmt.money(p.projection)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">{g.left}</dt>
                      <dd className="tnum mt-0.5 font-bold">{fmt.money(p.left)}</dd>
                    </div>
                    <div>
                      <dt className="text-muted">{g.perDay}</dt>
                      <dd className="tnum mt-0.5 font-bold">{fmt.money(p.perDay)}</dd>
                    </div>
                  </dl>
                  <div className={`mt-5 flex items-start gap-3 rounded-xl p-4 text-sm ${reached || good ? "bg-positive/10" : "bg-primary-soft"}`}>
                    {reached ? <PartyPopper size={18} className="mt-0.5 shrink-0 text-positive" /> : good ? <TrendingUp size={18} className="mt-0.5 shrink-0 text-positive" /> : <Rocket size={18} className="mt-0.5 shrink-0 text-primary" />}
                    <div>
                      <p className="font-bold">{reached ? g.reached : good ? g.onTrack : g.speedUp}</p>
                      <p className="text-ink-2">
                        {reached ? g.reachedText : good ? g.onTrackText(fmt.pct(Math.round(p.projectionPct))) : g.speedUpText(fmt.pct(Math.round(p.projectionPct)))}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="mt-5 rounded-xl bg-surface-2 p-4 text-sm text-muted">{g.noGoal}</p>
              )}
            </section>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="card overflow-x-auto p-6">
          <h2 className="font-bold">{g.history}</h2>
          <table className="mt-4 w-full min-w-[420px] text-left text-sm">
            <thead className="text-xs font-bold uppercase tracking-wide text-muted">
              <tr>
                <th className="py-2">{g.month}</th>
                <th className="py-2 text-right">{g.revenueCol}</th>
                <th className="py-2 text-right">{g.goalCol}</th>
                <th className="py-2 text-right">{g.reachedCol}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {history.map((h) => {
                const pct = settings.goal_revenue > 0 ? (h.revenue / settings.goal_revenue) * 100 : 0;
                return (
                  <tr key={h.label}>
                    <td className="py-3 font-semibold">{h.label}</td>
                    <td className="tnum py-3 text-right font-bold">{fmt.money(h.revenue)}</td>
                    <td className="tnum py-3 text-right text-muted">{settings.goal_revenue > 0 ? fmt.money(settings.goal_revenue) : "—"}</td>
                    <td className="py-3 text-right">
                      <span className={`tnum rounded-md px-2 py-0.5 text-xs font-bold ${pct >= 100 ? "bg-positive/10 text-positive" : "bg-surface-2 text-muted"}`}>
                        {settings.goal_revenue > 0 ? fmt.pct(Math.round(pct)) : "—"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <form action={saveGoals} className="card h-fit space-y-4 p-6" id="editar">
          <h2 className="text-lg font-bold">{g.edit}</h2>
          <div>
            <label className="label" htmlFor="goal_revenue">{g.goalRevenue}</label>
            <input id="goal_revenue" name="goal_revenue" className="input tnum" inputMode="decimal" defaultValue={settings.goal_revenue ? fmt.dv(settings.goal_revenue) : ""} placeholder="5000" />
          </div>
          <div>
            <label className="label" htmlFor="goal_profit">{g.goalProfit}</label>
            <input id="goal_profit" name="goal_profit" className="input tnum" inputMode="decimal" defaultValue={settings.goal_profit ? fmt.dv(settings.goal_profit) : ""} placeholder="2500" />
          </div>
          <SubmitButton className="btn-primary w-full">{g.save}</SubmitButton>
        </form>
      </div>
    </>
  );
}
