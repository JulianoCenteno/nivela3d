"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import {
  CHECKOUT_BY_CYCLE,
  CYCLE_PRICES,
  CYCLES,
  cycleNote,
  type BillingCycle,
  type PaidPlan,
} from "@/lib/plans";

export interface PricingPlan {
  id: PaidPlan;
  name: string;
  desc: string;
  features: string[];
  featured?: boolean;
}

/** Seletor Mensal / Trimestral / Anual. Só mostra os ciclos recebidos. */
export function CycleToggle({
  cycles,
  value,
  onChange,
}: {
  cycles: BillingCycle[];
  value: BillingCycle;
  onChange: (c: BillingCycle) => void;
}) {
  if (cycles.length < 2) return null;
  return (
    <div role="radiogroup" aria-label="Período de cobrança" className="inline-flex flex-wrap justify-center gap-0.5 rounded-full border border-line bg-bg p-1">
      {CYCLES.filter((c) => cycles.includes(c.id)).map((c) => {
        const active = c.id === value;
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(c.id)}
            className={`flex items-center gap-1.5 rounded-full px-3 py-2 sm:gap-2 sm:px-4 text-sm font-semibold transition-colors ${
              active ? "bg-primary text-on-primary" : "text-ink-2 hover:bg-surface"
            }`}
          >
            {c.label}
            {c.badge && (
              <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${active ? "bg-on-primary/20 text-on-primary" : "bg-sage/15 text-sage"}`}>
                {c.badgeShort ? (
                  <>
                    <span className="sm:hidden">{c.badgeShort}</span>
                    <span className="hidden sm:inline">{c.badge}</span>
                  </>
                ) : (
                  c.badge
                )}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Cards de planos da página de vendas, com troca de ciclo. */
export function PricingPlans({ plans, cycles }: { plans: PricingPlan[]; cycles: BillingCycle[] }) {
  const [cycle, setCycle] = useState<BillingCycle>("mensal");

  return (
    <>
      <div className="mt-10 flex justify-center">
        <CycleToggle cycles={cycles} value={cycle} onChange={setCycle} />
      </div>
      <div className="mt-12 grid gap-6 lg:grid-cols-3 lg:items-stretch">
        {plans.map((p) => {
          const price = CYCLE_PRICES[p.id][cycle];
          const href = CHECKOUT_BY_CYCLE[p.id][cycle] || CHECKOUT_BY_CYCLE[p.id].mensal || "#planos";
          return (
            <div
              key={p.id}
              className={`relative flex flex-col rounded-3xl border p-8 ${p.featured ? "border-2 border-primary bg-bg shadow-[0_30px_70px_-30px_rgba(24,43,48,0.35)] lg:-my-4 lg:py-12" : "border-line bg-bg"}`}
            >
              {p.featured && (
                <span className="absolute -top-3.5 left-8 rounded-full bg-primary px-3 py-1 text-xs font-bold text-on-primary">Mais completo</span>
              )}
              <p className="text-xl font-extrabold">{p.name}</p>
              <p className="mt-1 text-muted">{p.desc}</p>
              <p className="tnum mt-6 flex items-baseline gap-1">
                <span className="text-lg font-bold text-muted">R$</span>
                <span className="text-5xl font-extrabold tracking-tight">{price.perMonth}</span>
                <span className="font-semibold text-muted">/mês</span>
              </p>
              <p className="mt-1 text-sm text-muted">{cycleNote(p.id, cycle)}</p>
              <ul className="mt-7 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2.5 text-[15px]">
                    <Check size={18} className="mt-0.5 shrink-0 text-sage" /> {f}
                  </li>
                ))}
              </ul>
              <a href={href} className={`mt-8 w-full py-3.5 text-base ${p.featured ? "btn-primary" : "btn-ghost"}`}>
                Assinar {p.name}
              </a>
            </div>
          );
        })}
      </div>
    </>
  );
}
