import { BarChart3, Download, Package, ShoppingBag } from "lucide-react";
import { MonthNav } from "@/components/MonthNav";
import { PageHeader } from "@/components/ui";
import { requireOwner } from "@/lib/guard";
import { buildReport } from "@/lib/reports";
import { getI18n, getT } from "@/i18n/server";
import { LOCALE_TAG } from "@/i18n/config";

export async function generateMetadata() {
  return { title: (await getT()).finance.reports.title };
}

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  await requireOwner();
  const sp = await searchParams;
  const { t, fmt, locale } = await getI18n();
  const r_ = t.finance.reports;
  const { period, monthly, products, channels } = await buildReport(sp.mes ?? "", LOCALE_TAG[locale]);
  const chTotal = channels.reduce((a, c) => a + c.revenue, 0);

  return (
    <>
      <PageHeader title={r_.title} description={r_.desc} action={<MonthNav base="/relatorios" ym={period.ym} label={period.label} />} />

      <section className="card overflow-x-auto p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 font-bold">
            <BarChart3 size={18} className="text-primary" /> {r_.monthly}
          </h2>
          <a href={`/relatorios/csv?mes=${period.ym}`} className="btn-ghost inline-flex items-center gap-1.5 px-3 py-2 text-sm">
            <Download size={15} /> {r_.csv}
          </a>
        </div>
        <table className="mt-4 w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs font-bold uppercase tracking-wide text-muted">
            <tr>
              <th className="py-2">{r_.month}</th>
              <th className="py-2 text-right">{r_.revenue}</th>
              <th className="py-2 text-right">{r_.cost}</th>
              <th className="py-2 text-right">{r_.fees}</th>
              <th className="py-2 text-right">{r_.expenses}</th>
              <th className="py-2 text-right">{r_.net}</th>
              <th className="py-2 text-right">{r_.margin}</th>
              <th className="py-2 text-right">{r_.orders}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {monthly.map(({ ym, label, s }) => (
              <tr key={ym} className={ym === period.ym ? "bg-primary-soft/40" : ""}>
                <td className="py-3 font-semibold">{label}</td>
                <td className="tnum py-3 text-right font-bold">{fmt.money(s.revenue)}</td>
                <td className="tnum py-3 text-right">{fmt.money(s.cost)}</td>
                <td className="tnum py-3 text-right">{fmt.money(s.fees)}</td>
                <td className="tnum py-3 text-right text-negative">{fmt.money(s.expenses)}</td>
                <td className={`tnum py-3 text-right font-bold ${s.netProfit < 0 ? "text-negative" : "text-positive"}`}>{fmt.money(s.netProfit)}</td>
                <td className="tnum py-3 text-right">{fmt.pct(Math.round(s.marginPct * 10) / 10)}</td>
                <td className="tnum py-3 text-right">{s.orders}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="card overflow-x-auto p-6">
          <h2 className="flex items-center gap-2 font-bold">
            <Package size={18} className="text-primary" /> {r_.products(period.label)}
          </h2>
          {products.length === 0 ? (
            <p className="mt-6 text-center text-muted">{r_.noSales}</p>
          ) : (
            <table className="mt-4 w-full min-w-[460px] text-left text-sm">
              <thead className="text-xs font-bold uppercase tracking-wide text-muted">
                <tr>
                  <th className="py-2">{r_.product}</th>
                  <th className="py-2 text-right">{r_.qty}</th>
                  <th className="py-2 text-right">{r_.revenue}</th>
                  <th className="py-2 text-right">{r_.gross}</th>
                  <th className="py-2 text-right">{r_.margin}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {products.slice(0, 15).map((p) => (
                  <tr key={p.name}>
                    <td className="py-3 font-semibold">{p.name}</td>
                    <td className="tnum py-3 text-right">{p.qty}</td>
                    <td className="tnum py-3 text-right">{fmt.money(p.revenue)}</td>
                    <td className={`tnum py-3 text-right font-bold ${p.profit < 0 ? "text-negative" : ""}`}>{fmt.money(p.profit)}</td>
                    <td className="tnum py-3 text-right">{fmt.pct(p.revenue ? Math.round((p.profit / p.revenue) * 1000) / 10 : 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="card p-6">
          <h2 className="flex items-center gap-2 font-bold">
            <ShoppingBag size={18} className="text-primary" /> {r_.channels(period.label)}
          </h2>
          {channels.length === 0 ? (
            <p className="mt-6 text-center text-muted">{r_.noSales}</p>
          ) : (
            <ul className="mt-5 space-y-4">
              {channels.map((c) => (
                <li key={c.name ?? "_"}>
                  <div className="mb-1.5 flex justify-between text-sm">
                    <span className="font-semibold text-ink-2">
                      {c.name ?? r_.noChannel} <span className="text-muted">· {c.orders}</span>
                    </span>
                    <span className="tnum font-bold">{fmt.money(c.revenue)}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-surface-2">
                    <div className="h-full rounded-full bg-sage" style={{ width: `${chTotal ? Math.max(2, (c.revenue / chTotal) * 100) : 0}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
