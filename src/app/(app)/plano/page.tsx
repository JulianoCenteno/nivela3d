import { requireOwner } from "@/lib/guard";
import { PlanUpgrade } from "@/components/PlanUpgrade";
import { PageHeader } from "@/components/ui";
import { getContext } from "@/lib/data";
import { availableCycles, planInfo } from "@/lib/plans";

export const metadata = { title: "Meu plano" };

export default async function PlanPage() {
  await requireOwner();
  const { plan, supabase, user } = await getContext();
  const { data: sub } = await supabase.from("subscriptions").select("*").maybeSingle();
  const current = planInfo(plan);

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

      <PlanUpgrade currentPlan={plan} cycles={availableCycles()} />
      <p className="mt-4 text-sm text-muted">Use o mesmo e-mail desta conta na compra para o plano ser liberado automaticamente.</p>
    </>
  );
}
