import { Check } from "lucide-react";
import { requireOwner } from "@/lib/guard";
import { PlanUpgrade } from "@/components/PlanUpgrade";
import { LifetimeOffers } from "@/components/LifetimeOffers";
import { PageHeader } from "@/components/ui";
import { getContext } from "@/lib/data";
import { availableCycles, lifetimeEnabled, lifetimeFor, planInfo } from "@/lib/plans";
import { getI18n } from "@/i18n/server";
import landing from "@/i18n/messages/landing";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.content.plan.title };
}

export default async function PlanPage() {
  await requireOwner();
  const { plan, supabase, user } = await getContext();
  const { t, locale, fmt } = await getI18n();
  const c = t.content.plan;
  const names = t.content.planNames;
  const { data: sub } = await supabase.from("subscriptions").select("*").maybeSingle();
  const current = planInfo(plan);
  const lifetime = locale !== "pt" || lifetimeEnabled();
  const L = landing[locale];
  const offer = lifetimeFor(locale);
  const money = (v: string) => `${offer.symbol}${locale === "en" ? "" : " "}${v}`;
  const basico = { id: "iniciante" as const, ...L.plans.iniciante };
  const completo = { id: "profissional" as const, ...L.plans.profissional, featured: true };
  const upgradeHref = offer.upgrade.href || offer.completo.href;

  return (
    <>
      <PageHeader title={c.title} description={c.account(user.email ?? "")} />

      <div className="card mb-8 p-6">
        <p className="text-sm font-semibold text-muted">{c.current}</p>
        <p className="mt-1 text-2xl font-extrabold">{current ? names[plan as keyof typeof names] ?? current.label : c.none}</p>
        {sub?.current_period_end &&
          (new Date(sub.current_period_end).getUTCFullYear() >= 2099 ? (
            <p className="mt-1 text-sm font-semibold text-sage">{c.lifetime}</p>
          ) : (
            <p className="mt-1 text-sm text-muted">
              {sub.status === "active" ? c.renews : c.until} {fmt.date(sub.current_period_end)}
            </p>
          ))}
        <p className="mt-3 text-sm text-muted">{c.otherEmail}</p>
      </div>

      {!lifetime ? (
        <PlanUpgrade currentPlan={plan} cycles={availableCycles()} />
      ) : plan === "iniciante" ? (
        <div className="card max-w-xl border-2 border-primary p-7">
          <p className="text-xl font-extrabold">{L.offers.popH(money(offer.upgrade.price))}</p>
          <p className="mt-1 text-sm font-semibold text-sage">{L.offers.once}</p>
          <ul className="mt-5 space-y-2.5">
            {L.offers.gains.map((g) => (
              <li key={g} className="flex gap-2.5 text-[15px]">
                <Check size={18} className="mt-0.5 shrink-0 text-sage" /> {g}
              </li>
            ))}
          </ul>
          {upgradeHref ? (
            <a href={upgradeHref} target="_blank" rel="noopener" className="btn-primary mt-6 w-full py-3">
              {L.offers.yes(money(offer.upgrade.price))}
            </a>
          ) : (
            <span className="btn-ghost mt-6 w-full cursor-default opacity-60">{c.soon}</span>
          )}
        </div>
      ) : plan === "profissional" || plan === "empresa" ? null : (
        <div className="-mt-8">
          <LifetimeOffers basico={basico} completo={completo} locale={locale} />
        </div>
      )}
      <p className="mt-6 text-sm text-muted">{c.sameEmail}</p>
    </>
  );
}
