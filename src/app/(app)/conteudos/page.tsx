import { requireOwner } from "@/lib/guard";
import { BadgePercent, Download, ExternalLink, FileText, Gift, LayoutTemplate, Lock, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Flash, PageHeader } from "@/components/ui";
import { getContext } from "@/lib/data";
import { bonusesFor } from "@/lib/bonus";
import { checkoutFor, comboFor, extrasFor } from "@/lib/extras";
import { getI18n } from "@/i18n/server";

export async function generateMetadata() {
  const { t } = await getI18n();
  return { title: t.content.title };
}


export default async function ContentsPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  await requireOwner();
  const sp = await searchParams;
  const { supabase, plan } = await getContext();
  const { t, locale } = await getI18n();
  const c = t.content;
  const EXTRAS = extrasFor(locale);
  const BONUSES = bonusesFor(locale);
  const COMBO = comboFor(locale);
  const { data } = await supabase.from("purchases").select("product").eq("status", "active");
  const owned = new Set((data ?? []).map((p) => p.product as string));
  const activePlan = plan !== "nenhum";
  const missing = EXTRAS.filter((e) => !owned.has(e.code)).length;
  const combo = COMBO.href;

  return (
    <>
      <PageHeader title={c.title} description={c.desc} />
      <Flash erro={sp.erro} />

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <ShoppingBag size={20} className="text-sage" /> {c.extras}
        </h2>
        {missing >= 2 && combo && (
          <div className="mb-5 flex flex-col gap-4 rounded-2xl bg-[#182B30] p-6 text-[#F5F3EE] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#C5B79E]">{c.comboTag}</p>
              <p className="mt-1 text-lg font-extrabold">{c.comboTitle}</p>
              <p className="tnum mt-1 text-[15px] text-[#F5F3EE]/70">
                {c.from} <s>{COMBO.fullPrice}</s> {c.for} <b className="text-[#F5F3EE]">{COMBO.price}</b>
              </p>
            </div>
            <a href={combo} target="_blank" rel="noopener" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8FA69A] px-5 py-3 font-bold text-[#10191C] hover:bg-[#A3B8AD]">
              {c.wantAll} <Gift size={18} />
            </a>
          </div>
        )}
        <div className="grid gap-5 md:grid-cols-2">
          {EXTRAS.map((e) => {
            const has = owned.has(e.code);
            const checkout = checkoutFor(e.code, locale);
            const Icon = e.items[0].file ? FileText : LayoutTemplate;
            return (
              <article key={e.code} className={`card flex flex-col p-6 ${has ? "border-primary/40" : ""}`}>
                <div className="flex items-start gap-4">
                  <div className={`rounded-2xl p-3 ${has ? "bg-primary-soft text-primary" : "bg-surface-2 text-muted"}`}>
                    <Icon size={24} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold">{e.title}</h3>
                      {has ? (
                        <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">{c.released}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-bold text-muted">
                          <Lock size={12} /> {c.locked}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 text-sm text-muted">{e.format}</p>
                  </div>
                </div>
                <p className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-2">{e.description}</p>

                {has ? (
                  <div className="mt-5 space-y-2">
                    {e.items.map((it, i) => (
                      <a
                        key={it.label}
                        href={`/api/conteudos/${e.code}?item=${i}`}
                        target={it.canvaEnv ? "_blank" : undefined}
                        rel="noopener"
                        className="btn-ghost w-full justify-between text-left"
                      >
                        <span>{it.label}</span>
                        {it.canvaEnv ? <ExternalLink size={17} /> : <Download size={17} />}
                      </a>
                    ))}
                    {e.items.some((it) => it.canvaEnv) && (
                      <p className="hint">{c.canvaHint}</p>
                    )}
                  </div>
                ) : (
                  <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-surface-2 p-3 pl-4">
                    <span className="tnum font-extrabold">{e.price}</span>
                    {checkout ? (
                      <a href={checkout} target="_blank" rel="noopener" className="btn-primary px-4 py-2.5 text-sm">
                        {c.buyNow}
                      </a>
                    ) : (
                      <span className="text-sm font-semibold text-muted">{c.soon}</span>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-muted">
          {c.stillLocked}
        </p>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <Gift size={20} className="text-sage" /> {c.bonuses}
        </h2>
        {!activePlan && (
          <p className="mb-4 rounded-xl bg-negative-soft px-4 py-3 text-sm font-medium text-negative">
            {c.bonusNeedsPlan} <Link href="/plano" className="underline">{c.seePlans}</Link>
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/clube" className="card flex items-center gap-4 p-5 transition hover:border-primary">
            <div className="rounded-xl bg-sand-soft p-3 text-ink-2"><BadgePercent size={22} /></div>
            <div>
              <p className="font-bold">{c.club}</p>
              <p className="text-sm text-muted">{c.clubText}</p>
            </div>
          </Link>
          {BONUSES.map((b) => (
            <div key={b.slug} className="card flex items-center gap-4 p-5">
              <div className={`rounded-xl p-3 ${activePlan ? "bg-sand-soft text-ink-2" : "bg-surface-2 text-muted"}`}><FileText size={22} /></div>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{b.title}</p>
                <p className="text-sm text-muted">{b.description}</p>
              </div>
              {activePlan ? (
                <a href={`/api/bonus/${b.slug}`} className="btn-ghost shrink-0 gap-1.5 px-3 py-2 text-sm" aria-label={c.download(b.title)}>
                  <Download size={16} /> PDF
                </a>
              ) : (
                <Lock size={18} className="shrink-0 text-muted" />
              )}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
