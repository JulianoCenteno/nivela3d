import { AlertTriangle, ArrowDownRight, ArrowUpRight, Boxes } from "lucide-react";
import Link from "next/link";
import { EmpresaHint, UpgradeCard } from "@/components/gestao";
import { SubmitButton } from "@/components/SubmitButton";
import { Flash, PageHeader } from "@/components/ui";
import { getContext, getMaterials, getProducts, getSupplies } from "@/lib/data";
import { getMovements } from "@/lib/gestao-data";
import { hasFeature } from "@/lib/plans";
import { moveStock, setStockMin } from "../gestao-actions";
import { getI18n, getT } from "@/i18n/server";
import type { Dict } from "@/i18n/dict";
import type { Fmt } from "@/i18n/format";

export async function generateMetadata() {
  return { title: (await getT()).manage.stock.title };
}

type Line = { type: "material" | "supply" | "product"; id: string; name: string; qty: number; min: number; unit: string };

function qtyFmt(number: Fmt["number"]) {
  return (l: Pick<Line, "qty" | "unit">) => {
    if (l.unit === "g") return Math.abs(l.qty) >= 1000 ? `${number(l.qty / 1000)} kg` : `${number(l.qty)} g`;
    return `${number(l.qty)} ${l.unit}`;
  };
}

function Group({ title, lines, empty, t, fmt }: { title: string; lines: Line[]; empty: React.ReactNode; t: Dict; fmt: Fmt }) {
  const fmtQty = qtyFmt(fmt.number);
  const s_ = t.manage.stock;
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
                      <AlertTriangle size={14} /> {neg ? s_.negative : s_.belowMin}
                    </p>
                  )}
                </div>
                <p className={`tnum w-24 text-right text-lg font-extrabold ${low || neg ? "text-negative" : ""}`}>{fmtQty(l)}</p>
                <form action={setStockMin} className="flex items-center gap-1.5">
                  <input type="hidden" name="item_type" value={l.type} />
                  <input type="hidden" name="item_id" value={l.id} />
                  <label className="text-xs font-semibold text-muted" htmlFor={`min-${l.id}`}>{s_.min}</label>
                  <input id={`min-${l.id}`} name="min" defaultValue={fmt.dv(l.min)} className="input tnum w-20 px-2 py-1.5 text-sm" inputMode="decimal" />
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
  const { t, fmt } = await getI18n();
  const s_ = t.manage.stock;
  const fmtQty = qtyFmt(fmt.number);
  if (!hasFeature(plan, "gestao")) {
    return (
      <>
        <PageHeader title={s_.title} />
        <UpgradeCard plan="Profissional" title={s_.lockedTitle} text={s_.lockedText} bullets={s_.lockedBullets} />
      </>
    );
  }
  const auto = hasFeature(plan, "automacoes");
  const [materials, supplies, products, moves] = await Promise.all([getMaterials(), getSupplies(), getProducts(), getMovements()]);
  const mats: Line[] = materials.map((m) => ({ type: "material", id: m.id, name: m.name, qty: m.stock_g, min: m.min_stock_g, unit: "g" }));
  const sups: Line[] = supplies.map((s) => ({ type: "supply", id: s.id, name: s.name, qty: s.stock_qty, min: s.min_qty, unit: s.unit || s_.unit }));
  const prods: Line[] = products.map((p) => ({ type: "product", id: p.id, name: p.name, qty: p.stock_qty, min: p.min_qty, unit: s_.unit }));
  const low = [...mats, ...sups, ...prods].filter((l) => (l.min > 0 && l.qty <= l.min) || l.qty < 0);

  return (
    <>
      <PageHeader title={s_.title} description={s_.desc} />
      <Flash ok={sp.ok} erro={sp.erro} />

      {low.length > 0 && (
        <div className="mb-6 rounded-2xl bg-negative-soft p-4 text-negative">
          <p className="flex items-center gap-2 font-bold"><AlertTriangle size={18} /> {s_.restock}</p>
          <p className="mt-1 text-[15px]">{low.map((l) => `${l.name} (${fmtQty(l)})`).join(" · ")}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Group t={t} fmt={fmt} title={s_.filaments} lines={mats} empty={<>{s_.emptyMat} <Link href="/materiais" className="font-semibold text-primary underline">{t.common.nav.materiais}</Link>.</>} />
          <Group t={t} fmt={fmt} title={s_.supplies} lines={sups} empty={<>{s_.emptySup} <Link href="/insumos" className="font-semibold text-primary underline">{t.common.nav.insumos}</Link>.</>} />
          <Group t={t} fmt={fmt} title={s_.ready} lines={prods} empty={<>{s_.emptyProd} <Link href="/produtos" className="font-semibold text-primary underline">{t.common.nav.produtos}</Link>.</>} />
        </div>

        <aside className="space-y-4">
          <form action={moveStock} className="card space-y-4 p-5">
            <h2 className="flex items-center gap-2 font-bold"><Boxes size={18} /> {s_.move}</h2>
            <div>
              <label className="label" htmlFor="item">{s_.item}</label>
              <select id="item" name="item" className="input" required defaultValue="">
                <option value="" disabled>{s_.choose}</option>
                {mats.length > 0 && <optgroup label={s_.grpFilaments}>{mats.map((l) => <option key={l.id} value={`material:${l.id}`}>{l.name}</option>)}</optgroup>}
                {sups.length > 0 && <optgroup label={s_.grpSupplies}>{sups.map((l) => <option key={l.id} value={`supply:${l.id}`}>{l.name}</option>)}</optgroup>}
                {prods.length > 0 && <optgroup label={s_.grpReady}>{prods.map((l) => <option key={l.id} value={`product:${l.id}`}>{l.name}</option>)}</optgroup>}
              </select>
            </div>
            <fieldset className="grid grid-cols-3 gap-2 text-sm font-semibold">
              {(["entrada", "saida", "ajuste"] as const).map((v) => [v, s_.kinds[v]] as const).map(([v, l], i) => (
                <label key={v} className="flex cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-line py-2.5 has-[:checked]:border-primary has-[:checked]:bg-primary-soft has-[:checked]:text-primary">
                  <input type="radio" name="kind" value={v} defaultChecked={i === 0} className="sr-only" /> {l}
                </label>
              ))}
            </fieldset>
            <div>
              <label className="label" htmlFor="qty">{s_.qty}</label>
              <input id="qty" name="qty" className="input tnum" inputMode="decimal" placeholder={s_.qtyPh} required />
              <p className="hint">{s_.countHint}</p>
            </div>
            <div>
              <label className="label" htmlFor="reason">{s_.reason}</label>
              <input id="reason" name="reason" className="input" placeholder={s_.reasonPh} />
            </div>
            <SubmitButton className="btn-primary w-full">{s_.saveMove}</SubmitButton>
          </form>
          {!auto && <EmpresaHint>{s_.autoUpsell}</EmpresaHint>}

          <section className="card p-5">
            <h2 className="mb-3 font-bold">{s_.lastMoves}</h2>
            {moves.length === 0 ? (
              <p className="text-sm text-muted">{s_.noneYet}</p>
            ) : (
              <ul className="space-y-2.5">
                {moves.map((m) => (
                  <li key={m.id} className="flex items-start gap-2 text-sm">
                    {m.qty >= 0 ? <ArrowUpRight size={16} className="mt-0.5 shrink-0 text-positive" /> : <ArrowDownRight size={16} className="mt-0.5 shrink-0 text-negative" />}
                    <span className="min-w-0 flex-1">
                      <b>{m.item_name}</b> <span className="tnum">{m.qty >= 0 ? "+" : ""}{fmtQty({ qty: m.qty, unit: m.item_type === "material" ? "g" : s_.unit })}</span>
                      <span className="block truncate text-muted">{m.reason} · {fmt.date(m.created_at)}</span>
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
