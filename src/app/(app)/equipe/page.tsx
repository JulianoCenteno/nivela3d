import { CheckCircle2, Clock, Users } from "lucide-react";
import { headers } from "next/headers";
import { CopyButton } from "@/components/CopyButton";
import { DeleteButton } from "@/components/DeleteButton";
import { UpgradeCard } from "@/components/gestao";
import { SubmitButton } from "@/components/SubmitButton";
import { Flash, PageHeader } from "@/components/ui";
import { getContext, getSettings } from "@/lib/data";
import { getTeam } from "@/lib/gestao-data";
import { hasFeature } from "@/lib/plans";
import { inviteMember, removeMember } from "../gestao-actions";

export const metadata = { title: "Equipe" };

export default async function TeamPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  const { plan, role, user } = await getContext();

  if (role === "membro") {
    const settings = await getSettings();
    return (
      <>
        <PageHeader title="Equipe" />
        <div className="card max-w-xl p-6">
          <Users className="text-sage" />
          <p className="mt-3 text-lg font-bold">Você faz parte da equipe{settings.business_name ? ` de ${settings.business_name}` : ""}.</p>
          <p className="mt-1 text-muted">Você vê e registra orçamentos, pedidos, estoque e vendas da conta. O plano e o financeiro ficam com o dono.</p>
        </div>
      </>
    );
  }

  if (!hasFeature(plan, "equipe")) {
    return (
      <>
        <PageHeader title="Equipe" />
        <UpgradeCard
          plan="Empresa"
          title="Traga sua equipe para o Nivela"
          text="Convide quem te ajuda na produção e no atendimento. Cada um com o próprio login, todos trabalhando na mesma conta."
          bullets={["Até 5 pessoas na equipe", "Pedidos com responsável", "Só você vê o financeiro e o plano"]}
        />
      </>
    );
  }

  const [team, h] = await Promise.all([getTeam(), headers()]);
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const msg = (email: string) =>
    `Oi! Te adicionei na equipe do meu negócio no Nivela 3D. Crie sua conta com o e-mail ${email} neste link: ${origin}/cadastro (se já tiver conta, é só entrar em ${origin}/login).`;

  return (
    <>
      <PageHeader title="Equipe" description="Convide até 5 pessoas. Elas entram com o próprio login e trabalham nos seus orçamentos, pedidos, estoque e vendas." />
      <Flash ok={sp.ok} erro={sp.erro} />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-line px-5 py-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
              {(user.email ?? "?").slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{user.email}</p>
              <p className="text-sm text-muted">Dono da conta · vê tudo, inclusive financeiro e plano</p>
            </div>
          </div>
          {team.length === 0 ? (
            <p className="px-5 py-6 text-muted">Ninguém convidado ainda.</p>
          ) : (
            <ul className="divide-y divide-line">
              {team.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{m.name || m.email}</p>
                    <p className="truncate text-sm text-muted">{m.email}</p>
                    {m.status === "ativo" ? (
                      <p className="flex items-center gap-1 text-sm font-semibold text-positive"><CheckCircle2 size={14} /> Já está usando</p>
                    ) : (
                      <p className="flex items-center gap-1 text-sm font-semibold text-ink-2"><Clock size={14} /> Aguardando criar a conta</p>
                    )}
                  </div>
                  {m.status === "pendente" && <CopyButton text={msg(m.email)} label="Copiar convite" className="btn-ghost px-3 py-2 text-sm" />}
                  <DeleteButton id={m.id} action={removeMember} confirmText={`Remover ${m.email} da equipe?`} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <form action={inviteMember} className="card h-fit space-y-4 p-5">
          <h2 className="font-bold">Convidar pessoa</h2>
          <div>
            <label className="label" htmlFor="name">Nome</label>
            <input id="name" name="name" className="input" placeholder="Ex.: Ana" />
          </div>
          <div>
            <label className="label" htmlFor="email">E-mail</label>
            <input id="email" name="email" type="email" className="input" required placeholder="ana@email.com" />
            <p className="hint">A pessoa cria a conta com este e-mail e entra direto na sua equipe.</p>
          </div>
          <SubmitButton className="btn-primary w-full" pendingText="Convidando…">Convidar</SubmitButton>
          <p className="text-sm text-muted">{team.length}/5 pessoas</p>
        </form>
      </div>
    </>
  );
}
