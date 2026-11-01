import { Calculator, Check, Package, Printer, Receipt, Settings, Spool } from "lucide-react";
import Link from "next/link";
import { MonthNav } from "@/components/MonthNav";
import { PageHeader, Stat } from "@/components/ui";
import { saleTotals } from "@/lib/calc";
import { getContext, getMaterials, getPrinters, getProducts, getSales, getSettings } from "@/lib/data";
import { money, number, pct } from "@/lib/format";
import { fmtDate, monthRange } from "@/lib/period";

export const metadata = { title: "Painel" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ mes?: string }> }) {
  const sp = await searchParams;
  const period = monthRange(sp.mes);
  const [{ profile }, sales, printers, materials, products, settings] = await Promise.all([
    getContext(),
    getSales(period.from, period.to),
    getPrinters(),
    getMaterials(),
    getProducts(),
    getSettings(),
  ]);

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
  const margin = sum.revenue > 0 ? (sum.profit / sum.revenue) * 100 : 0;

  // Lucro por categoria
  const byCat = new Map<string, number>();
  for (const r of rows) byCat.set(r.category || "Sem categoria", (byCat.get(r.category || "Sem categoria") ?? 0) + r.t.profit);
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
    { done: settings.energy_price_kwh !== 0.95 || settings.labor_per_hour !== 20, label: "Ajuste seus custos (energia e hora de trabalho)", href: "/configuracoes", icon: Settings },
    { done: printers.length > 0, label: "Cadastre sua impressora", href: "/impressoras", icon: Printer },
    { done: materials.length > 0, label: "Cadastre um filamento", href: "/materiais", icon: Spool },
    { done: products.length > 0, label: "Calcule e salve seu primeiro produto", href: "/produtos/novo", icon: Package },
    { done: sales.length > 0, label: "Registre uma venda", href: "/vendas", icon: Receipt },
  ];
  const pending = steps.filter((s) => !s.done).length;
  const first = (profile?.name || "").split(" ")[0];

  return (
    <>
      <PageHeader
        title={first ? `Olá, ${first}` : "Painel"}
        description="Quanto entrou, quanto saiu e quanto realmente sobrou."
        action={<MonthNav base="/painel" ym={period.ym} label={period.label} />}
      />

      {pending > 0 && (
        <section className="card mb-8 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Primeiros passos</h2>
            <span className="text-sm font-semibold text-muted">{steps.length - pending} de {steps.length}</span>
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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Faturamento" value={money(sum.revenue)} hint={`${number(sum.units)} peças vendidas`} />
        <Stat label="Taxas de canais" value={money(sum.fees)} />
        <Stat label="Custos + frete" value={money(sum.cost)} />
        <Stat
          label="Lucro real"
          value={money(sum.profit)}
          hint={sum.revenue > 0 ? `Margem de ${pct(margin)}` : undefined}
          tone={sum.profit < 0 ? "negative" : sum.profit > 0 ? "positive" : undefined}
        />
      </div>

      {rows.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center px-6 py-12 text-center">
          <Calculator size={28} className="text-sage" />
          <p className="mt-3 font-bold">Sem vendas em {period.label}</p>
          <p className="mt-1 max-w-sm text-muted">Registre suas vendas para ver aqui o lucro por categoria e os produtos campeões.</p>
          <Link href="/vendas" className="btn-primary mt-5">Registrar venda</Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="card p-6">
            <h2 className="font-bold">Lucro por categoria</h2>
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
            <h2 className="font-bold">Produtos que mais deram lucro</h2>
            <ol className="mt-4 divide-y divide-line">
              {top.map((p, i) => (
                <li key={p.name + i} className="flex items-center gap-3 py-3">
                  <span className="tnum w-6 text-sm font-bold text-muted">{i + 1}</span>
                  <span className="flex-1 font-semibold">{p.name}</span>
                  <span className="tnum hidden text-sm text-muted sm:inline">{p.units} un.</span>
                  <span className={`tnum shrink-0 text-right font-bold ${p.profit < 0 ? "text-negative" : ""}`}>{money(p.profit)}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="card p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="font-bold">Últimas vendas</h2>
              <Link href={`/vendas?mes=${period.ym}`} className="text-sm font-semibold text-primary hover:underline">Ver todas</Link>
            </div>
            <ul className="mt-3 divide-y divide-line">
              {rows.slice(0, 6).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <p className="font-semibold">{r.quantity > 1 ? `${r.quantity}× ` : ""}{r.description}</p>
                    <p className="text-sm text-muted">{fmtDate(r.sold_at)}</p>
                  </div>
                  <div className="text-right">
                    <p className="tnum font-semibold">{money(r.t.revenue)}</p>
                    <p className={`tnum text-sm ${r.t.profit < 0 ? "text-negative" : "text-positive"}`}>lucro {money(r.t.profit)}</p>
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
