"use client";

import { Check, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { lifetimeFor } from "@/lib/plans";
import type { Locale } from "@/i18n/config";
import landing from "@/i18n/messages/landing";
import type { PricingPlan } from "@/components/PricingPlans";


/**
 * Duas ofertas de pagamento único com acesso vitalício.
 * Clicar no Básico abre um pop-up oferecendo o Completo com desconto.
 */
export function LifetimeOffers({ basico, completo, locale = "pt" }: { basico: PricingPlan; completo: PricingPlan; locale?: Locale }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const LIFETIME = lifetimeFor(locale);
  const T = landing[locale].offers;
  // Sem checkout configurado ainda: leva para o cadastro em vez de um link quebrado.
  const fallback = "/cadastro";
  const basicoHref = LIFETIME.basico.href || fallback;
  const completoHref = LIFETIME.completo.href || fallback;
  const upgradeHref = LIFETIME.upgrade.href || completoHref;
  const upgradePrice = LIFETIME.upgrade.href || !LIFETIME.completo.href ? LIFETIME.upgrade.price : LIFETIME.completo.price;
  const toNum = (v: string) => Number(v.replace(",", "."));
  const sep = locale === "pt" ? "," : ".";
  const money = (v: string) => `${LIFETIME.symbol}${locale === "en" ? "" : " "}${v}`;
  const diffNum = toNum(upgradePrice) - toNum(LIFETIME.basico.price);
  const diff = money(Number.isInteger(Math.round(diffNum * 100) / 100) ? String(Math.round(diffNum)) : diffNum.toFixed(2).replace(".", sep));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("a")?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const offers = [
    { p: basico, price: LIFETIME.basico.price, label: T.basic },
    { p: completo, price: LIFETIME.completo.price, label: T.complete },
  ];

  return (
    <>
      <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2 md:items-stretch">
        {offers.map(({ p, price, label }) => {
          const featured = p.featured;
          return (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-3xl border p-8 ${featured ? "border-2 border-primary bg-bg shadow-[0_30px_70px_-30px_rgba(24,43,48,0.35)] md:-my-4 md:py-12" : "border-line bg-bg"}`}
            >
              {featured && (
                <span className="absolute -top-3.5 left-8 rounded-full bg-primary px-3 py-1 text-xs font-bold text-on-primary">{T.popular}</span>
              )}
              <p className="text-xl font-extrabold">{label}</p>
              <p className="mt-1 text-muted">{p.desc}</p>
              <p className="tnum mt-6 flex items-baseline gap-1">
                <span className="text-lg font-bold text-muted">{LIFETIME.symbol}</span>
                <span className="text-5xl font-extrabold tracking-tight">{price}</span>
              </p>
              <p className="mt-1 text-sm font-semibold text-sage">{T.once}</p>
              <ul className="mt-7 flex-1 space-y-3">
                {p.features.map((f) => f.replace("Tudo do Iniciante", T.allOfBasic)).map((f) => (
                  <li key={f} className="flex gap-2.5 text-[15px]">
                    <Check size={18} className="mt-0.5 shrink-0 text-sage" /> {f}
                  </li>
                ))}
              </ul>
              {featured ? (
                <a href={completoHref} className="btn-primary mt-8 w-full py-3.5 text-base">
                  {T.wantComplete}
                </a>
              ) : (
                <button type="button" onClick={() => setOpen(true)} className="btn-ghost mt-8 w-full py-3.5 text-base">
                  {T.wantBasic}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-4 sm:items-center"
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="upgrade-title"
            className="relative w-full max-w-md rounded-3xl bg-bg p-7 shadow-2xl sm:p-8"
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={T.close}
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted hover:bg-surface"
            >
              <X size={20} />
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sand-soft px-3 py-1 text-xs font-bold text-ink-2">
              <Sparkles size={14} /> {T.only}
            </span>
            <h3 id="upgrade-title" className="mt-4 text-2xl font-extrabold tracking-tight">
              {T.popH(diff)}
            </h3>
            <p className="mt-2 text-muted">
              {T.popP1}<b className="text-ink">{money(upgradePrice)}</b>{T.popP2(money(LIFETIME.completo.price))}
            </p>
            <ul className="mt-5 space-y-2.5">
              {T.gains.map((g) => (
                <li key={g} className="flex gap-2.5 text-[15px]">
                  <Check size={18} className="mt-0.5 shrink-0 text-sage" /> {g}
                </li>
              ))}
            </ul>
            <a href={upgradeHref} className="btn-primary mt-7 w-full py-3.5 text-base">
              {T.yes(money(upgradePrice))}
            </a>
            <a href={basicoHref} className="mt-3 block w-full py-2 text-center text-sm font-semibold text-muted underline-offset-4 hover:underline">
              {T.no(money(LIFETIME.basico.price))}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
