import { AlertTriangle, ArrowDownRight, ArrowUpRight, Boxes } from "lucide-react";
import Link from "next/link";
import { EmpresaHint, UpgradeCard } from "@/components/gestao";
import { SubmitButton } from "@/components/SubmitButton";
import { dv, Flash, PageHeader } from "@/components/ui";
import { getContext, getMaterials, getProducts, getSupplies } from "@/lib/data";
import { number } from "@/lib/format";
import { getMovements } from "@/lib/gestao-data";
import { hasFeature } from "@/lib/plans";
import { moveStock, setStockMin } from "../gestao-actions";

export const metadata = { title: "Estoque" };

type Line = { type: "material" | "supply" | "product"; id: string; name: string; qty: number; min: number; unit: string };

function fmtQty(l: Pick<Line, "qty" | "unit">) {
  if (l.unit === "g") return Math.abs(l.qty) >= 1000 ? `${number(l.qty / 1000)} kg` : `${number(l.qty)} g`;
  return `${number(l.qty)} ${l.unit}`;
}

function Group({ title, lines, empty }: { title: string; lines: Line[]; empty: React.ReactNode }) {
  return (
    <section className="card overflow-hidden">
      <h2 className="border-b border-line px-5 py-3.5 font-bold">{title}</h2>
      {lines.length === 0 ? (
        <p className="px-5 py-4 text-sm text-muted">{empty}</p>
      ) : (
        <ul className="divide-y divide-line">
          {lines.map((l) => {
            const low = l.min > 0 && l.qty <= l.min;
            const neg = l.qty < 0;
            return (
              <li key={l.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{l.name}</p>
                  {(low || neg) && (
                    <p className="flex items-center gap-1 text-sm font-semibold text-negative">
                      <AlertTriangle size={14} /> {neg ? "Estoque negativo: confira a contagem" : "Abaixo do mínimo"}
                    </p>
                  )}
                </div>
                <p className={`tnum w-24 text-right text-lg font-extrabold ${low || neg ? "text-negative" : ""}`}>{fmtQty(l)}</p>
                <form action={setStockMin} className="flex items-center gap-1.5">
                  <input type="hidden" name="item_type" value={l.type} />
                  <input type="hidden" name="item_id" value={l.id} />
                  <label className="text-xs font-semibold text-muted" htmlFor={`min-${l.id}`}>mín.</label>
                  <input id={`min-${l.id}`} name="min" defaultValue={dv(l.min)} className="input tnum w-20 px-2 py-1.5 text-sm" inputMode="decimal" />
                  <button className="btn-ghost px-2.5 py-1.5 text-xs">OK</button>
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default async function StockPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  const { plan } = await getContext();
  if (!hasFeature(plan, "gestao")) {
    return (
      <>
        <PageHeader title="Estoque" />
        <UpgradeCard
          plan="Profissional"
          title="Nunca mais pare uma impressão por falta de filamento"
          text="Saiba quanto filamento, quantas argolas e quantas peças prontas você tem, e o que precisa comprar."
          bullets={["Filamento em gramas, insumos e peças prontas", "Estoque mínimo com aviso", "Histórico de entradas e saídas"]}
        />
      </>
    );
  }
  const auto = hasFeature(plan, "automacoes");
  const [materials, supplies, products, moves] = await Promise.all([getMaterials(), getSupplies(), getProducts(), getMovements()]);
  const mats: Line[] = materials.map((m) => ({ type: "material", id: m.id, name: m.name, qty: m.stock_g, min: m.min_stock_g, unit: "g" }));
  const sups: Line[] = supplies.map((s) => ({ type: "supply", id: s.id, name: s.name, qty: s.stock_qty, min: s.min_qty, unit: s.unit || "un" }));
  const prods: Line[] = products.map((p) => ({ type: "product", id: p.id, name: p.name, qty: p.stock_qty, min: p.min_qty, unit: "un" }));
  const low = [...mats, ...sups, ...prods].filter((l) => (l.min > 0 && l.qty <= l.min) || l.qty < 0);

  return (
    <>
      <PageHeader title="Estoque" description="Filamento, insumos e peças prontas. Registre compras e contagens, e defina o mínimo para receber aviso." />
      <Flash ok={sp.ok} erro={sp.erro} />

      {low.length > 0 && (
        <div className="mb-6 rounded-2xl bg-negative-soft p-4 text-negative">
          <p className="flex items-center gap-2 font-bold"><AlertTriangle size={18} /> Hora de repor</p>
          <p className="mt-1 text-[15px]">{low.map((l) => `${l.name} (${fmtQty(l)})`).join(" · ")}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Group title="Filamentos e resinas" lines={mats} empty={<>Cadastre seus materiais em <Link href="/materiais" className="font-semibold text-primary underline">Materiais</Link>.</>} />
          <Group title="Insumos" lines={sups} empty={<>Cadastre argolas, ímãs e embalagens em <Link href="/insumos" className="font-semibold text-primary underline">Insumos</Link>.</>} />
          <Group title="Peças prontas (pronta entrega)" lines={prods} empty={<>Cadastre seus produtos em <Link href="/produtos" className="font-semibold text-primary underline">Produtos</Link>.</>} />
        </div>

        <aside className="space-y-4">
          <form action={moveStock} className="card space-y-4 p-5">
            <h2 className="flex items-center gap-2 font-bold"><Boxes size={18} /> Movimentar estoque</h2>
            <div>
              <label className="label" htmlFor="item">Item</label>
              <select id="item" name="item" className="input" required defaultValue="">
                <option value="" disabled>Escolha…</option>
                {mats.length > 0 && <optgroup label="Filamentos (gramas)">{mats.map((l) => <option key={l.id} value={`material:${l.id}`}>{l.name}</option>)}</optgroup>}
                {sups.length > 0 && <optgroup label="Insumos">{sups.map((l) => <option key={l.id} value={`supply:${l.id}`}>{l.name}</option>)}</optgroup>}
                {prods.length > 0 && <optgroup label="Peças prontas">{prods.map((l) => <option key={l.id} value={`product:${l.id}`}>{l.name}</option>)}</optgroup>}
              </select>
            </div>
            <fieldset className="grid grid-cols-3 gap-2 text-sm font-semibold">
              {[["entrada", "Entrada"], ["saida", "Saída"], ["ajuste", "Contagem"]].map(([v, l], i) => (
                <label key={v} className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-line py-2.5 has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:checked]:text-primary">
                  <input type="radio" name="kind" value={v} defaultChecked={i === 0} className="sr-only" /> {l}
                </label>
              ))}
            </fieldset>
            <div>
              <label className="label" htmlFor="qty">Quantidade</label>
              <input id="qty" name="qty" className="input tnum" inputMode="decimal" placeholder="Filamento em gramas (1 kg = 1000)" required />
              <p className="hint">Em &quot;Contagem&quot;, informe o total que você contou.</p>
            </div>
            <div>
              <label className="label" htmlFor="reason">Motivo (opcional)</label>
              <input id="reason" name="reason" className="input" placeholder="Ex.: compra de 2 rolos" />
            </div>
            <SubmitButton className="btn-primary w-full">Salvar movimentação</SubmitButton>
          </form>
          {!auto && <EmpresaHint>Baixa automática de filamento e insumos a cada venda e pedido:</EmpresaHint>}

          <section className="card p-5">
            <h2 className="mb-3 font-bold">Últimas movimentações</h2>
            {moves.length === 0 ? (
              <p className="text-sm text-muted">Nenhuma ainda.</p>
            ) : (
              <ul className="space-y-2.5">
                {moves.map((m) => (
                  <li key={m.id} className="flex items-start gap-2 text-sm">
                    {m.qty >= 0 ? <ArrowUpRight size={16} className="mt-0.5 shrink-0 text-positive" /> : <ArrowDownRight size={16} className="mt-0.5 shrink-0 text-negative" />}
                    <span className="min-w-0 flex-1">
                      <b>{m.item_name}</b> <span className="tnum">{m.qty >= 0 ? "+" : ""}{fmtQty({ qty: m.qty, unit: m.item_type === "material" ? "g" : "un" })}</span>
                      <span className="block truncate text-muted">{m.reason} · {new Date(m.created_at).toLocaleDateString("pt-BR", { timeZone: "America/Sao_Paulo" })}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
