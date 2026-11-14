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
import { getT } from "@/i18n/server";

export async function generateMetadata() {
  return { title: (await getT()).manage.team.title };
}

export default async function TeamPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  const { plan, role, user } = await getContext();
  const t_ = (await getT()).manage.team;

  if (role === "membro") {
    const settings = await getSettings();
    return (
      <>
        <PageHeader title={t_.title} />
        <div className="card max-w-xl p-6">
          <Users className="text-sage" />
          <p className="mt-3 text-lg font-bold">{t_.memberOf(settings.business_name ?? "")}</p>
          <p className="mt-1 text-muted">{t_.memberText}</p>
        </div>
      </>
    );
  }

  if (!hasFeature(plan, "equipe")) {
    return (
      <>
        <PageHeader title={t_.title} />
        <UpgradeCard plan="Empresa" title={t_.lockedTitle} text={t_.lockedText} bullets={t_.lockedBullets} />
      </>
    );
  }

  const [team, h] = await Promise.all([getTeam(), headers()]);
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const msg = (email: string) => t_.invite(email, origin);

  return (
    <>
      <PageHeader title={t_.title} description={t_.desc} />
      <Flash ok={sp.ok} erro={sp.erro} />
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <section className="card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-line px-5 py-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-on-primary">
              {(user.email ?? "?").slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold">{user.email}</p>
              <p className="text-sm text-muted">{t_.owner}</p>
            </div>
          </div>
          {team.length === 0 ? (
            <p className="px-5 py-6 text-muted">{t_.none}</p>
          ) : (
            <ul className="divide-y divide-line">
              {team.map((m) => (
                <li key={m.id} className="flex flex-wrap items-center gap-3 px-5 py-4">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{m.name || m.email}</p>
                    <p className="truncate text-sm text-muted">{m.email}</p>
                    {m.status === "ativo" ? (
                      <p className="flex items-center gap-1 text-sm font-semibold text-positive"><CheckCircle2 size={14} /> {t_.active}</p>
                    ) : (
                      <p className="flex items-center gap-1 text-sm font-semibold text-ink-2"><Clock size={14} /> {t_.pending}</p>
                    )}
                  </div>
                  {m.status === "pendente" && <CopyButton text={msg(m.email)} label={t_.copyInvite} className="btn-ghost px-3 py-2 text-sm" />}
                  <DeleteButton id={m.id} action={removeMember} confirmText={t_.removeConfirm(m.email)} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <form action={inviteMember} className="card h-fit space-y-4 p-5">
          <h2 className="font-bold">{t_.invitePerson}</h2>
          <div>
            <label className="label" htmlFor="name">{t_.name}</label>
            <input id="name" name="name" className="input" placeholder={t_.namePh} />
          </div>
          <div>
            <label className="label" htmlFor="email">{t_.email}</label>
            <input id="email" name="email" type="email" className="input" required placeholder={t_.emailPh} />
            <p className="hint">{t_.emailHint}</p>
          </div>
          <SubmitButton className="btn-primary w-full" pendingText={t_.inviting}>{t_.inviteBtn}</SubmitButton>
          <p className="text-sm text-muted">{t_.count(team.length)}</p>
        </form>
      </div>
    </>
  );
}
