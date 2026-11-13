import { Package, Plus, RefreshCw } from "lucide-react";
import Link from "next/link";
import { SubmitButton } from "@/components/SubmitButton";
import { Empty, Flash, PageHeader } from "@/components/ui";
import { evaluatePrice } from "@/lib/calc";
import { getContext, getProducts } from "@/lib/data";
import { money, pct } from "@/lib/format";
import { planInfo, UNLIMITED } from "@/lib/plans";
import { recalcAllProducts } from "../actions";

export const metadata = { title: "Produtos" };

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const [{ plan }, all] = await Promise.all([getContext(), getProducts()]);
  const q = (sp.q ?? "").toLowerCase();
  const products = q
    ? all.filter((p) => p.name.toLowerCase().includes(q) || (p.category ?? "").toLowerCase().includes(q))
    : all;
  const limit = planInfo(plan)?.products ?? 0;

  return (
    <>
      <PageHeader
        title="Produtos"
        description="Seu catálogo com custo, preço e margem de cada peça (margem sem taxas de canal)."
        action={
          <Link href="/produtos/novo" className="btn-primary">
            <Plus size={18} /> Novo produto
          </Link>
        }
      />
      <Flash ok={sp.ok} erro={sp.erro} />

      {all.length === 0 ? (
        <Empty
          icon={<Package size={28} />}
          title="Nenhum produto ainda"
          text="Cadastre suas peças para saber o lucro de cada uma e registrar vendas mais rápido."
          href="/produtos/novo"
          cta="Cadastrar primeiro produto"
        />
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <form className="w-full sm:max-w-xs">
              <input name="q" defaultValue={sp.q} placeholder="Buscar por nome ou categoria" className="input" />
            </form>
            <form action={recalcAllProducts}>
              <SubmitButton className="btn-ghost text-sm" pendingText="Recalculando…">
                <RefreshCw size={16} /> Recalcular custos
              </SubmitButton>
            </form>
          </div>

          <ul className="card divide-y divide-line sm:hidden">
            {products.map((p) => {
              const r = evaluatePrice(p.sale_price, p.unit_cost);
              const bad = p.sale_price > 0 && r.profit < 0;
              return (
                <li key={p.id}>
                  <Link href={`/produtos/${p.id}`} className="flex items-center justify-between gap-3 px-4 py-3.5">
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{p.name}</p>
                      <p className="tnum text-sm text-muted">
                        {p.category ? `${p.category} · ` : ""}custo {money(p.unit_cost)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="tnum font-bold">{p.sale_price > 0 ? money(p.sale_price) : "—"}</p>
                      {p.sale_price > 0 && (
                        <p className={`tnum text-sm font-semibold ${bad ? "text-negative" : "text-positive"}`}>
                          {money(r.profit)} · {pct(r.marginPct)}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="card hidden overflow-x-auto sm:block">
            <table className="w-full min-w-[640px] text-left">
              <thead className="border-b border-line text-xs font-bold uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-5 py-3.5">Produto</th>
                  <th className="px-5 py-3.5 text-right">Custo</th>
                  <th className="px-5 py-3.5 text-right">Preço</th>
                  <th className="px-5 py-3.5 text-right">Lucro</th>
                  <th className="px-5 py-3.5 text-right">Margem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {products.map((p) => {
                  const r = evaluatePrice(p.sale_price, p.unit_cost);
                  const bad = p.sale_price > 0 && r.profit < 0;
                  return (
                    <tr key={p.id} className="transition hover:bg-surface-2">
                      <td className="px-5 py-4">
                        <Link href={`/produtos/${p.id}`} className="font-semibold hover:text-primary">{p.name}</Link>
                        {p.category && <p className="text-sm text-muted">{p.category}</p>}
                      </td>
                      <td className="tnum px-5 py-4 text-right">{money(p.unit_cost)}</td>
                      <td className="tnum px-5 py-4 text-right font-semibold">{p.sale_price > 0 ? money(p.sale_price) : "—"}</td>
                      <td className={`tnum px-5 py-4 text-right font-semibold ${bad ? "text-negative" : "text-positive"}`}>
                        {p.sale_price > 0 ? money(r.profit) : "—"}
                      </td>
                      <td className={`tnum px-5 py-4 text-right ${bad ? "text-negative" : ""}`}>
                        {p.sale_price > 0 ? pct(r.marginPct) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-muted">{limit >= UNLIMITED ? `${all.length} produtos · ilimitados no seu plano.` : `${all.length} de ${limit} produtos do seu plano.`}</p>
        </>
      )}
    </>
  );
}
