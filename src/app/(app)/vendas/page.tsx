import { Receipt } from "lucide-react";
import { DeleteButton } from "@/components/DeleteButton";
import { MonthNav } from "@/components/MonthNav";
import { SaleForm } from "@/components/SaleForm";
import { Flash, PageHeader } from "@/components/ui";
import { saleTotals } from "@/lib/calc";
import { getChannels, getProducts, getSales } from "@/lib/data";
import { money } from "@/lib/format";
import { fmtDate, monthRange, todayISO } from "@/lib/period";
import { deleteSale } from "../actions";

export const metadata = { title: "Vendas" };

export default async function SalesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string; mes?: string }>;
}) {
  const sp = await searchParams;
  const period = monthRange(sp.mes);
  const [sales, products, channels] = await Promise.all([
    getSales(period.from, period.to),
    getProducts(),
    getChannels(),
  ]);
  const channelName = new Map(channels.map((c) => [c.id, c.name]));
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
  const total = rows.reduce((a, r) => ({ revenue: a.revenue + r.t.revenue, profit: a.profit + r.t.profit }), { revenue: 0, profit: 0 });

  return (
    <>
      <PageHeader
        title="Vendas"
        description="Registre cada venda para ver o lucro real depois de taxas, custos e frete."
        action={<MonthNav base="/vendas" ym={period.ym} label={period.label} />}
      />
      <Flash ok={sp.ok} erro={sp.erro} />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section>
          {rows.length === 0 ? (
            <div className="card flex items-center gap-4 p-6 text-muted">
              <Receipt className="shrink-0 text-sage" /> Nenhuma venda em {period.label}.
            </div>
          ) : (
            <>
            <ul className="card divide-y divide-line sm:hidden">
              {rows.map((s) => (
                <li key={s.id} className="flex items-center gap-3 px-4 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">
                      {s.quantity > 1 && <span className="text-muted">{s.quantity}× </span>}
                      {s.description}
                    </p>
                    <p className="text-sm text-muted">
                      {fmtDate(s.sold_at)} · {(s.channel_id && channelName.get(s.channel_id)) || "Sem canal"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="tnum font-semibold">{money(s.t.revenue)}</p>
                    <p className={`tnum text-sm font-semibold ${s.t.profit < 0 ? "text-negative" : "text-positive"}`}>lucro {money(s.t.profit)}</p>
                  </div>
                  <DeleteButton id={s.id} action={deleteSale} label="" confirmText="Remover esta venda?" />
                </li>
              ))}
              <li className="flex justify-between bg-surface-2 px-4 py-3.5 font-bold">
                <span>Total do mês</span>
                <span className="tnum text-right">
                  {money(total.revenue)}
                  <span className={`block text-sm ${total.profit < 0 ? "text-negative" : "text-positive"}`}>lucro {money(total.profit)}</span>
                </span>
              </li>
            </ul>
            <div className="card hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[600px] text-left">
                <thead className="border-b border-line text-xs font-bold uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-5 py-3.5">Venda</th>
                    <th className="px-5 py-3.5 text-right">Faturamento</th>
                    <th className="px-5 py-3.5 text-right">Lucro</th>
                    <th className="w-12 px-2 py-3.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {rows.map((s) => (
                    <tr key={s.id}>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold">
                          {s.quantity > 1 && <span className="text-muted">{s.quantity}× </span>}
                          {s.description}
                        </p>
                        <p className="text-sm text-muted">
                          {fmtDate(s.sold_at)} · {(s.channel_id && channelName.get(s.channel_id)) || "Sem canal"}
                        </p>
                      </td>
                      <td className="tnum px-5 py-3.5 text-right">{money(s.t.revenue)}</td>
                      <td className={`tnum px-5 py-3.5 text-right font-semibold ${s.t.profit < 0 ? "text-negative" : "text-positive"}`}>
                        {money(s.t.profit)}
                      </td>
                      <td className="px-2 py-3.5">
                        <DeleteButton id={s.id} action={deleteSale} label="" confirmText="Remover esta venda?" />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-line bg-surface-2 font-bold">
                  <tr>
                    <td className="px-5 py-3.5">Total do mês</td>
                    <td className="tnum px-5 py-3.5 text-right">{money(total.revenue)}</td>
                    <td className={`tnum px-5 py-3.5 text-right ${total.profit < 0 ? "text-negative" : "text-positive"}`}>{money(total.profit)}</td>
                    <td />
                  </tr>
                </tfoot>
              </table>
            </div>
            </>
          )}
        </section>
        <SaleForm products={products} channels={channels} today={todayISO()} />
      </div>
    </>
  );
}
