import { BadgePercent, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { getI18n } from "@/i18n/server";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.content.club };
}

export default async function ClubPage() {
  const { t } = await getI18n();
  const c = t.content.clubPage;
  const whatsapp = process.env.NEXT_PUBLIC_CLUBE_WHATSAPP;
  const telegram = process.env.NEXT_PUBLIC_CLUBE_TELEGRAM;
  return (
    <>
      <PageHeader title={t.content.club} description={c.desc} />
      <div className="card flex flex-col gap-6 p-8 md:flex-row md:items-center">
        <div className="rounded-2xl bg-sand-soft p-5 text-ink-2">
          <BadgePercent size={36} />
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold">{c.included}</p>
          <p className="mt-1 max-w-xl text-muted">{c.text}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
          {whatsapp && (
            <a href={whatsapp} target="_blank" rel="noopener" className="btn-primary">
              {c.whatsapp} <ExternalLink size={16} />
            </a>
          )}
          {telegram && (
            <a href={telegram} target="_blank" rel="noopener" className="btn-ghost">
              {c.telegram} <ExternalLink size={16} />
            </a>
          )}
          {!whatsapp && !telegram && <span className="text-sm font-semibold text-muted">{c.soon}</span>}
        </div>
      </div>
    </>
  );
}
