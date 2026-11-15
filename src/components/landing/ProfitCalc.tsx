"use client";

import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";

type Labels = {
  weight: string;
  hours: string;
  price: string;
  perMonth: string;
  cost: string;
  fair: string;
  table: string;
  tableEnd: string;
  perPiece?: unknown;
  ok: string;
  note: string;
  cta: string;
};

/** Custos médios de mercado usados na simulação (por moeda). */
const COSTS = {
  BRL: { kg: 120, kwh: 0.92, kw: 0.15, wearH: 0.8, laborH: 25 },
  USD: { kg: 22, kwh: 0.16, kw: 0.15, wearH: 0.15, laborH: 15 },
};

/** Calculadora interativa "quanto você deveria cobrar" da página de vendas. */
export function ProfitCalc({ labels, currency, locale, perPiece, ctaHref = "#planos" }: { labels: Labels; currency: "BRL" | "USD"; locale: string; perPiece: string; ctaHref?: string }) {
  const usd = currency === "USD";
  const [g, setG] = useState("85");
  const [h, setH] = useState("4");
  const [price, setPrice] = useState(usd ? "8" : "30");
  const [qty, setQty] = useState("40");
  const nf = useMemo(() => new Intl.NumberFormat(locale, { style: "currency", currency }), [locale, currency]);
  const num = (s: string) => {
    const v = Number(String(s).replace(",", "."));
    return Number.isFinite(v) && v > 0 ? v : 0;
  };

  const c = COSTS[currency];
  const W = num(g), H = num(h), P = num(price), Q = Math.round(num(qty));
  const base = (W / 1000) * c.kg + H * c.kw * c.kwh + H * c.wearH;
  const cost = base * 1.1 + c.laborH * 0.25;
  // preço que deixa 45% de margem depois de 14% de taxa
  const fair = cost / (1 - 0.14 - 0.45);
  const gap = Math.max(0, fair - P);
  const month = gap * Q;

  const field = (label: string, value: string, set: (v: string) => void, prefix?: string) => (
    <label className="block">
      <span className="text-sm font-semibold text-ink-2">{label}</span>
      <div className="relative mt-1.5">
        {prefix && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">{prefix}</span>}
        <input value={value} onChange={(e) => set(e.target.value)} inputMode="decimal" className={`input w-full text-lg font-bold ${prefix ? "pl-11" : ""}`} />
      </div>
    </label>
  );

  return (
    <div className="grid gap-6 rounded-3xl border border-line bg-surface p-6 shadow-[0_30px_80px_-30px_rgba(24,43,48,0.3)] sm:p-8 lg:grid-cols-2">
      <div className="grid grid-cols-2 gap-4">
        {field(labels.weight, g, setG)}
        {field(labels.hours, h, setH)}
        {field(labels.price, price, setPrice, usd ? "$" : "R$")}
        {field(labels.perMonth, qty, setQty)}
        <p className="col-span-2 text-xs leading-relaxed text-muted">{labels.note}</p>
      </div>
      <div className="flex flex-col justify-between gap-5 rounded-2xl bg-bg p-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-surface-2 p-4">
            <p className="text-sm font-semibold text-muted">{labels.cost}</p>
            <p className="tnum mt-1 text-2xl font-extrabold">{nf.format(cost)}</p>
          </div>
          <div className="rounded-xl bg-primary p-4 text-on-primary">
            <p className="text-sm font-semibold opacity-80">{labels.fair}</p>
            <p className="tnum mt-1 text-2xl font-extrabold">{nf.format(fair)}</p>
          </div>
        </div>
        {gap > 0.009 ? (
          <div>
            <p className="text-lg font-semibold text-ink-2">{labels.table}</p>
            <p className="tnum text-5xl font-extrabold tracking-tight text-[#B4533C] dark:text-[#E08A72]">{nf.format(month)}</p>
            <p className="mt-1 text-lg font-semibold text-ink-2">{labels.tableEnd}</p>
            <p className="mt-1 text-sm text-muted">{perPiece.replace("{v}", nf.format(gap))}</p>
          </div>
        ) : (
          <p className="text-lg font-semibold text-positive">{labels.ok}</p>
        )}
        <a href={ctaHref} className="btn-primary px-6 py-3.5 text-base">
          {labels.cta} <ArrowRight size={18} />
        </a>
      </div>
    </div>
  );
}
