import { requireOwner } from "@/lib/guard";
import { Check } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { getContext } from "@/lib/data";
import { CHECKOUT_LINKS, PLANS, planInfo } from "@/lib/plans";

export const metadata = { title: "Meu plano" };

export default async function PlanPage() {
  await requireOwner();
  const { plan, supabase, user } = await getContext();
  const { data: sub } = await supabase.from("subscriptions").select("*").maybeSingle();
  const current = planInfo(plan);
  const order = ["iniciante", "profissional", "empresa"] as const;

  return (
    <>
      <PageHeader title="Meu plano" description={`Conta: ${user.email}`} />

      <div className="card mb-8 p-6">
        <p className="text-sm font-semibold text-muted">Plano atual</p>
        <p className="mt-1 text-2xl font-extrabold">{current?.label ?? "Sem plano ativo"}</p>
        {sub?.current_period_end && (
          <p className="mt-1 text-sm text-muted">
            {sub.status === "active" ? "Renova em" : "Acesso até"}{" "}
            {new Date(sub.current_period_end).toLocaleDateString("pt-BR")}
          </p>
        )}
        <p className="mt-3 text-sm text-muted">
          Assinou com outro e-mail? Fale com o suporte para vincular sua compra a esta conta.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        {order.map((id) => {
          const p = PLANS[id];
          const featured = id === "profissional";
          const isCurrent = plan === id;
          const link = CHECKOUT_LINKS[id];
          return (
            <div key={id} className={`card flex flex-col p-6 ${featured ? "border-2 border-primary" : ""}`}>
              <p className="font-bold">{p.label}</p>
              <p className="tnum mt-2 text-3xl font-extrabold tracking-tight">{p.price.replace("/mês", "")}<span className="text-base font-semibold text-muted">/mês</span></p>
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
      <p className="mt-4 text-sm text-muted">Use o mesmo e-mail desta conta na compra para o plano ser liberado automaticamente.</p>
    </>
  );
}
