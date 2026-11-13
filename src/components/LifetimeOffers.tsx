"use client";

import { Check, Sparkles, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { LIFETIME } from "@/lib/plans";
import type { PricingPlan } from "@/components/PricingPlans";

/** Recursos que o Completo tem e o Básico não (mostrados no pop-up). */
const UPGRADE_GAINS = ["Impressoras ilimitadas", "Produtos ilimitados", "Orçamentos, pedidos e estoque", "Relatórios completos"];

/**
 * Duas ofertas de pagamento único com acesso vitalício.
 * Clicar no Básico abre um pop-up oferecendo o Completo com desconto.
 */
export function LifetimeOffers({ basico, completo }: { basico: PricingPlan; completo: PricingPlan }) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const upgradeHref = LIFETIME.upgrade.href || LIFETIME.completo.href!;
  const upgradePrice = LIFETIME.upgrade.href ? LIFETIME.upgrade.price : LIFETIME.completo.price;
  const diff = Number(upgradePrice) - Number(LIFETIME.basico.price);

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
    { p: basico, price: LIFETIME.basico.price, label: "Básico" },
    { p: completo, price: LIFETIME.completo.price, label: "Completo" },
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
                <span className="absolute -top-3.5 left-8 rounded-full bg-primary px-3 py-1 text-xs font-bold text-on-primary">Mais escolhido</span>
              )}
              <p className="text-xl font-extrabold">{label}</p>
              <p className="mt-1 text-muted">{p.desc}</p>
              <p className="tnum mt-6 flex items-baseline gap-1">
                <span className="text-lg font-bold text-muted">R$</span>
                <span className="text-5xl font-extrabold tracking-tight">{price}</span>
              </p>
              <p className="mt-1 text-sm font-semibold text-sage">Pagamento único · acesso vitalício</p>
              <ul className="mt-7 flex-1 space-y-3">
                {p.features.map((f) => f.replace("Tudo do Iniciante", "Tudo do Básico")).map((f) => (
                  <li key={f} className="flex gap-2.5 text-[15px]">
                    <Check size={18} className="mt-0.5 shrink-0 text-sage" /> {f}
                  </li>
                ))}
              </ul>
              {featured ? (
                <a href={LIFETIME.completo.href} className="btn-primary mt-8 w-full py-3.5 text-base">
                  Quero o Completo
                </a>
              ) : (
                <button type="button" onClick={() => setOpen(true)} className="btn-ghost mt-8 w-full py-3.5 text-base">
                  Quero o Básico
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
              aria-label="Fechar"
              className="absolute right-4 top-4 rounded-full p-1.5 text-muted hover:bg-surface"
            >
              <X size={20} />
            </button>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-sand-soft px-3 py-1 text-xs font-bold text-ink-2">
              <Sparkles size={14} /> Oferta só nesta tela
            </span>
            <h3 id="upgrade-title" className="mt-4 text-2xl font-extrabold tracking-tight">
              Leve o Completo por só +R$ {diff}
            </h3>
            <p className="mt-2 text-muted">
              Por <b className="text-ink">R$ {upgradePrice}</b> em vez de R$ {LIFETIME.completo.price}, você leva tudo do Básico e
              mais o controle do seu negócio. Também é pagamento único, com acesso vitalício.
            </p>
            <ul className="mt-5 space-y-2.5">
              {UPGRADE_GAINS.map((g) => (
                <li key={g} className="flex gap-2.5 text-[15px]">
                  <Check size={18} className="mt-0.5 shrink-0 text-sage" /> {g}
                </li>
              ))}
            </ul>
            <a href={upgradeHref} className="btn-primary mt-7 w-full py-3.5 text-base">
              Sim, quero o Completo por R$ {upgradePrice}
            </a>
            <a href={LIFETIME.basico.href} className="mt-3 block w-full py-2 text-center text-sm font-semibold text-muted underline-offset-4 hover:underline">
              Não, quero só o Básico por R$ {LIFETIME.basico.price}
            </a>
          </div>
        </div>
      )}
    </>
  );
}
