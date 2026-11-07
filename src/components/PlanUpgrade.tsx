"use client";

import { Check } from "lucide-react";
import { useState } from "react";
import { CycleToggle } from "@/components/PricingPlans";
import { CHECKOUT_BY_CYCLE, CYCLE_PRICES, PLANS, cycleNote, type BillingCycle, type PaidPlan } from "@/lib/plans";

/** Cards de planos dentro do app (página "Meu plano"), com troca de ciclo. */
export function PlanUpgrade({ currentPlan, cycles }: { currentPlan: string; cycles: BillingCycle[] }) {
  const [cycle, setCycle] = useState<BillingCycle>("mensal");
  const order: PaidPlan[] = ["iniciante", "profissional", "empresa"];

  return (
    <>
      <div className="mb-5">
        <CycleToggle cycles={cycles} value={cycle} onChange={setCycle} />
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {order.map((id) => {
          const p = PLANS[id];
          const featured = id === "profissional";
          const isCurrent = currentPlan === id;
          const link = CHECKOUT_BY_CYCLE[id][cycle];
          return (
            <div key={id} className={`card flex flex-col p-6 ${featured ? "border-2 border-primary" : ""}`}>
              <p className="font-bold">{p.label}</p>
              <p className="tnum mt-2 text-3xl font-extrabold tracking-tight">
                R$ {CYCLE_PRICES[id][cycle].perMonth}
                <span className="text-base font-semibold text-muted">/mês</span>
              </p>
              <p className="mt-0.5 text-sm text-muted">{cycleNote(id, cycle)}</p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2 text-[15px] text-ink-2">
                    <Check size={18} className="mt-0.5 shrink-0 text-sage" /> {f}
                  </li>
                ))}
              </ul>
              {isCurrent ? (
                <span className="btn-ghost mt-6 cursor-default">Seu plano atual</span>
              ) : link ? (
                <a href={link} target="_blank" rel="noopener" className={`mt-6 ${featured ? "btn-primary" : "btn-ghost"}`}>
                  Assinar {p.label}
                </a>
              ) : (
                <span className="btn-ghost mt-6 cursor-default opacity-60">Link de compra em breve</span>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
