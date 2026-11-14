import {
  ArrowRight,
  BadgePercent,
  Calculator,
  Check,
  ChevronDown,
  LayoutDashboard,
  Paperclip,
  Printer,
  Receipt,
  Search,
  ShieldCheck,
  Smartphone,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Logo, LogoMark } from "@/components/Logo";
import { PhoneCarousel } from "@/components/PhoneCarousel";
import { MetaPixel } from "@/components/MetaPixel";
import { PricingPlans, type PricingPlan } from "@/components/PricingPlans";
import { availableCycles, lifetimeEnabled, lifetimeFor } from "@/lib/plans";
import type { Locale } from "@/i18n/config";
import landing from "@/i18n/messages/landing";
import { makeFmt } from "@/i18n/format";
import { DEFAULT_CURRENCY } from "@/i18n/config";
import { LandingLangSwitcher } from "@/components/LandingLangSwitcher";
import { LifetimeOffers } from "@/components/LifetimeOffers";

const XRAY_ICONS = [Search, Calculator, ShieldCheck, TrendingUp];
const STEP_ICONS = [Printer, Calculator, Receipt];
const CARD_ICONS = [Printer, Calculator, Smartphone, Sparkles];
const SLIDE_SRC = ["cel-calculadora", "cel-painel", "cel-insumos", "cel-produtos", "cel-vendas", "cel-impressoras", "cel-painel-escuro"];

function Shot({ src, alt, w = 2880, h = 1800, className = "", priority = false }: { src: string; alt: string; w?: number; h?: number; className?: string; priority?: boolean }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_30px_80px_-30px_rgba(24,43,48,0.35)] ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-line bg-surface-2 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
      </div>
      <Image src={src} alt={alt} width={w} height={h} className="h-auto w-full" sizes="(min-width: 1024px) 900px, 100vw" priority={priority} />
    </div>
  );
}

function Phone({ src, alt, className = "" }: { src: string; alt: string; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[2.2rem] border-[7px] border-[#182B30] bg-[#182B30] shadow-[0_30px_70px_-20px_rgba(24,43,48,0.55)] ${className}`}>
      <Image src={src} alt={alt} width={780} height={1688} className="h-auto w-full rounded-[1.7rem]" sizes="260px" />
    </div>
  );
}

export function SalesPage({ upsell = false, declineUrl, locale = "pt" }: { upsell?: boolean; declineUrl?: string; locale?: Locale }) {
  const L = landing[locale];
  // Fora do Brasil só existe a oferta vitalícia (assinatura em moeda estrangeira não é suportada).
  const lifetime = locale !== "pt" || lifetimeEnabled();
  // Prints e vídeo do app no idioma da página (fotos sem texto são compartilhadas).
  const A = locale === "pt" ? "/landing" : `/landing/${locale}`;
  const fmt = makeFmt(locale, DEFAULT_CURRENCY[locale]);
  const offer = lifetimeFor(locale);
  const home = locale === "pt" ? "/" : `/${locale}`;
  const PLANS: PricingPlan[] = (["iniciante", "profissional", "empresa"] as const).map((id) => ({
    id,
    ...L.plans[id],
    featured: id === "profissional",
  }));
  const LEAK = L.leak;
  const SLIDES = L.slides.map(([title, text], i) => ({ src: `${A}/${SLIDE_SRC[i]}.webp`, title, text }));
  const FAQ = L.faq;
  const UPSELL_FAQ = L.upsellFaq(lifetime);
  const BONUSES = L.bonuses;
  return (
    <div className="overflow-x-hidden">
      <MetaPixel page={upsell ? "upsell" : "landing"} />
      {upsell && (
        <div className="bg-[#182B30] px-5 py-3 text-center text-[15px] text-[#F5F3EE]">
          <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#8FA69A] align-[-3px] text-[#10191C]"><Check size={13} strokeWidth={3} /></span>
          <b>{L.upsellBar.done}</b> {L.upsellBar.sent} <span className="text-[#C5B79E]">{L.upsellBar.look}</span>
          {declineUrl && (
            <a href={declineUrl} className="ml-2 whitespace-nowrap font-semibold text-[#F5F3EE]/70 underline underline-offset-2 hover:text-[#F5F3EE]">{L.upsellBar.go}</a>
          )}
        </div>
      )}
      {/* ---------- Topo ---------- */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Link href={home} aria-label="Nivela 3D"><Logo size={28} /></Link>
          <nav className="hidden items-center gap-7 text-[15px] font-semibold text-ink-2 md:flex">
            <a href="#como-funciona" className="hover:text-primary">{L.nav.how}</a>
            <a href="#no-celular" className="hover:text-primary">{L.nav.mobile}</a>
            <a href="#recursos" className="hover:text-primary">{L.nav.features}</a>
            <a href="#planos" className="hover:text-primary">{L.nav.plans}</a>
            <a href="#perguntas" className="hover:text-primary">{L.nav.faq}</a>
          </nav>
          <div className="flex items-center gap-2">
            <LandingLangSwitcher locale={locale} upsell={upsell} />
            {!upsell && <Link href="/login" className="hidden rounded-xl px-3 py-2 text-[15px] font-semibold text-ink-2 hover:bg-surface-2 sm:block">{L.nav.login}</Link>}
            <a href="#planos" className="btn-primary px-4 py-2 text-sm sm:text-[15px]">{lifetime ? L.nav.wantAccess : L.nav.subscribe}</a>
          </div>
        </div>
      </header>

      <main>
        {/* ---------- Hero ---------- */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-12 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-20">
          <div>
            {upsell ? (
              <>
                <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-semibold text-primary">
                  <LogoMark size={16} /> {L.hero.upsellTag}
                </p>
                <h1 className="mt-6 text-[2.5rem] font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.6rem]">
                  {L.hero.upsellH1a}<span className="text-sage">{L.hero.upsellH1b}</span>{L.hero.upsellH1c}
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                  {L.hero.upsellP}
                </p>
              </>
            ) : (
              <>
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-semibold text-primary">
                <LogoMark size={16} /> {L.hero.tag}
              </p>
              <h1 className="mt-6 text-[2.5rem] font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.6rem]">
                {L.hero.h1a}<span className="text-sage">{L.hero.h1b}</span>{L.hero.h1c}
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                {L.hero.p}
              </p>
              </>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#planos" className="btn-primary px-6 py-3.5 text-base">
                {L.hero.cta} <ArrowRight size={18} />
              </a>
              <a href="#como-funciona" className="btn-ghost px-6 py-3.5 text-base">{L.hero.how}</a>
            </div>
            <p className="mt-4 text-sm text-muted">{lifetime ? L.hero.lifetimeNote(fmt.money(Number(offer.basico.price.replace(",", ".")))) : L.hero.subNote}</p>
          </div>

          <div className="relative pb-6 pl-[16%]">
            <div className="aspect-[5/4] overflow-hidden rounded-3xl">
              <Image src="/landing/oficina.webp" alt={L.hero.imgAlt} width={1536} height={1024} className="h-full w-full object-cover object-[60%_50%]" priority sizes="(min-width: 1024px) 560px, 100vw" />
            </div>
            <div className="absolute bottom-0 left-0 w-[33%] max-w-[210px]">
              <Phone src={`${A}/m-calculadora.webp`} alt={L.hero.phoneAlt} />
            </div>
          </div>
        </section>

        {/* ---------- Big Idea + Vazamento Invisível de Lucro ---------- */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-[1fr_1.05fr] lg:py-24">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-sage">{L.leakSec.kicker}</p>
              <h2 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight sm:text-[2.6rem]">{L.leakSec.h2}</h2>
              <p className="mt-5 text-lg leading-relaxed text-muted">
                {L.leakSec.p}
              </p>
              <div className="mt-7 rounded-2xl border border-line bg-bg p-6">
                <p className="text-sm font-bold uppercase tracking-wider text-[#B4533C] dark:text-[#E08A72]">{L.leakSec.nameKicker}</p>
                <p className="mt-1 text-xl font-extrabold">{L.leakSec.name}</p>
                <p className="mt-2 leading-relaxed text-muted">
                  {L.leakSec.nameP}
                </p>
              </div>
            </div>

            <div className="card p-6 sm:p-8">
              <p className="text-sm font-semibold text-muted">{L.leakSec.example}</p>
              <p className="tnum text-4xl font-extrabold tracking-tight">{fmt.money(50)}</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-surface-2 p-4">
                  <p className="text-sm font-semibold text-muted">{L.leakSec.thinks}</p>
                  <p className="tnum mt-1 text-2xl font-extrabold text-muted line-through decoration-2">{fmt.money(42)}</p>
                </div>
                <div className="rounded-xl bg-primary p-4 text-on-primary">
                  <p className="text-sm font-semibold opacity-80">{L.leakSec.real}</p>
                  <p className="tnum mt-1 text-2xl font-extrabold">{fmt.money(14)}</p>
                </div>
              </div>
              <ul className="mt-6 divide-y divide-line">
                {LEAK.map(([label, value]) => (
                  <li key={label} className="flex items-center gap-3 py-2.5 text-[15px]">
                    <span className="flex-1 font-semibold text-ink-2">{label}</span>
                    <span className="h-2 rounded-full bg-sage/70" style={{ width: `${value * 9}px` }} />
                    <span className="tnum w-20 text-right font-bold">{fmt.money(value)}</span>
                  </li>
                ))}
                <li className="flex items-center justify-between py-3 font-extrabold">
                  <span>{L.leakSec.cost}</span>
                  <span className="tnum">{fmt.money(36)}</span>
                </li>
              </ul>
              <p className="mt-3 text-xs text-muted">{L.leakSec.note}</p>
            </div>
          </div>
        </section>

        {/* ---------- Frase de autoridade ---------- */}
        <section className="mx-auto max-w-4xl px-5 pt-20 text-center lg:pt-24">
          <p className="text-2xl font-extrabold leading-snug tracking-tight sm:text-3xl">
            {L.quoteA}{" "}
            <span className="text-sage">{L.quoteB}</span>
          </p>
        </section>

        {/* ---------- Raio-X do Lucro 3D (mecanismo) ---------- */}
        <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wider text-sage">{L.xraySec.kicker}</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{L.xraySec.h2}</h2>
            <p className="mt-3 text-lg leading-relaxed text-muted">
              {L.xraySec.p}
            </p>
          </div>
          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.35fr] lg:items-center">
            <ol className="space-y-7">
              {L.xray.map(([title, text], i) => {
                const I = XRAY_ICONS[i];
                return (
                  <li key={title} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                      <I size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-sage">{i + 1}. {title}</p>
                      <p className="mt-1 leading-relaxed text-muted">{text}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <Shot src={`${A}/calculadora.webp`} alt={L.xraySec.shotAlt} />
          </div>
          <div className="mt-14 grid gap-4 rounded-3xl border border-line bg-surface p-6 sm:grid-cols-3 sm:p-8">
            {L.xraySec.steps.map(([t, d], i) => {
              const I = STEP_ICONS[i];
              return (
                <div key={t} className="flex gap-3">
                  <I size={20} className="mt-0.5 shrink-0 text-sage" />
                  <div>
                    <p className="font-bold">{L.xraySec.step(i + 1, t)}</p>
                    <p className="text-[15px] text-muted">{d}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ---------- No celular ---------- */}
        <section id="no-celular" className="scroll-mt-20 border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-wider text-sage">{L.mobileSec.kicker}</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{L.mobileSec.h2}</h2>
              <p className="mt-3 text-lg text-muted">{L.mobileSec.p}</p>
            </div>
            <div className="mt-12 grid items-start gap-12 lg:grid-cols-[300px_1fr]">
              <div className="mx-auto w-[78%] max-w-[300px] lg:w-full">
                <div className="overflow-hidden rounded-[2.4rem] border-[7px] border-[#182B30] bg-[#182B30] shadow-[0_30px_70px_-20px_rgba(24,43,48,0.55)]">
                  <video
                    src={`${A}/demo.mp4`}
                    poster={`${A}/demo-poster.jpg`}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="block aspect-[9/16] w-full rounded-[1.9rem] object-cover"
                    aria-label={L.mobileSec.videoAlt}
                  />
                </div>
                <p className="mt-3 text-center text-sm text-muted">{L.mobileSec.watch}</p>
              </div>
              <PhoneCarousel slides={SLIDES} prevLabel={L.carousel.prev} nextLabel={L.carousel.next} />
            </div>
          </div>
        </section>

        {/* ---------- Recursos ---------- */}
        <section id="recursos" className="scroll-mt-20 border-t border-line">
          <div className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-wider text-sage">{L.featSec.kicker}</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{L.featSec.h2}</h2>
              <p className="mt-3 text-lg text-muted">{L.featSec.p}</p>
            </div>

            <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
              <div><Shot src={`${A}/painel.webp`} alt={L.featSec.dashAlt} /></div>
              <div>
                <LayoutDashboard className="text-sage" />
                <h3 className="mt-3 text-2xl font-bold">{L.featSec.dashH}</h3>
                <p className="mt-2 leading-relaxed text-muted">
                  {L.featSec.dashP}
                </p>
              </div>
            </div>

            <div className="mt-20 grid items-center gap-10 lg:grid-cols-[1fr_1.4fr]">
              <div className="lg:order-1">
                <Paperclip className="text-sage" />
                <h3 className="mt-3 text-2xl font-bold">{L.featSec.prodH}</h3>
                <p className="mt-2 leading-relaxed text-muted">
                  {L.featSec.prodP}
                </p>
              </div>
              <div className="lg:order-2"><Shot src={`${A}/produto-insumos.webp`} alt={L.featSec.prodAlt} /></div>
            </div>

            <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {L.featSec.cards.map(([t, d], i) => {
                const I = CARD_ICONS[i];
                return (
                  <div key={t} className="rounded-2xl border border-line bg-bg p-6">
                    <I className="text-sage" size={22} />
                    <p className="mt-3 font-bold">{t}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{d}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------- Para quem ---------- */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:py-28">
          <div className="overflow-hidden rounded-3xl">
            <Image src="/landing/atelie.webp" alt={L.whoSec.imgAlt} width={1536} height={1024} className="h-auto w-full" sizes="(min-width: 1024px) 560px, 100vw" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-sage">{L.whoSec.kicker}</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{L.whoSec.h2}</h2>
            <ul className="mt-8 space-y-4">
              {L.whoSec.items.map(([b, t]) => (
                <li key={b} className="flex gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary"><Check size={14} /></span>
                  <p className="text-lg leading-relaxed"><b>{b}</b> <span className="text-muted">{t}</span></p>
                </li>
              ))}
            </ul>
            <a href="#planos" className="btn-primary mt-9 px-6 py-3.5 text-base">{L.whoSec.cta} <ArrowRight size={18} /></a>
          </div>
        </section>

        {/* ---------- Planos ---------- */}
        <section id="planos" className="scroll-mt-20 border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-sage">{L.plansSec.kicker}</p>
              {lifetime ? (
                <>
                  <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{L.plansSec.lifeH2}</h2>
                  <p className="mt-3 text-lg text-muted">{L.plansSec.lifeP}</p>
                </>
              ) : (
                <>
                  <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{L.plansSec.subH2}</h2>
                  <p className="mt-3 text-lg text-muted">{L.plansSec.subP}{" "}
                    {availableCycles().length > 1 ? L.plansSec.subCycles : ""}</p>
                </>
              )}
            </div>
            {lifetime ? (
              <LifetimeOffers basico={PLANS[0]} completo={PLANS[1]} locale={locale} />
            ) : (
              <PricingPlans plans={PLANS} cycles={availableCycles()} />
            )}
            <p className="mt-10 text-center text-muted">
              {L.plansSec.guarA(lifetime)} <b className="text-ink">{L.plansSec.guarB}</b>{L.plansSec.guarC}
            </p>
          </div>
        </section>

        {/* ---------- Bônus ---------- */}
        <section className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-sage">{L.bonusSec.kicker}</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{L.bonusSec.h2}</h2>
              <p className="mt-3 text-lg leading-relaxed text-muted">{L.bonusSec.p(lifetime)}</p>
              <div className="mt-8 rounded-2xl bg-sand-soft p-6">
                <BadgePercent className="text-ink-2" />
                <p className="mt-3 font-bold">{L.bonusSec.clubH}</p>
                <p className="mt-1 text-[15px] leading-relaxed text-muted">
                  {L.bonusSec.clubP}
                </p>
              </div>
            </div>
            <ol className="grid gap-3">
              {BONUSES.map(([t, d], i) => (
                <li key={t} className="card flex items-center gap-4 p-5">
                  <span className="tnum flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft font-extrabold text-primary">{i + 1}</span>
                  <div>
                    <p className="font-bold">{t}</p>
                    <p className="text-[15px] text-muted">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section id="perguntas" className="scroll-mt-20 border-t border-line bg-surface">
          <div className="mx-auto max-w-3xl px-5 py-20 lg:py-28">
            <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">{L.faqH2}</h2>
            <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-bg">
              {(upsell ? [...UPSELL_FAQ, ...FAQ] : FAQ).map(([q, a]) => (
                <details key={q} className="group p-6">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-bold">
                    {q}
                    <ChevronDown size={20} className="shrink-0 text-muted transition group-open:rotate-180" />
                  </summary>
                  <p className="mt-3 leading-relaxed text-muted">{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- CTA final ---------- */}
        <section className="px-5 py-20">
          <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-[#182B30] px-8 py-14 text-center text-[#F5F3EE] sm:px-14">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              {L.final.h2a}<br />
              <span className="text-[#8FA69A]">{L.final.h2b}</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-[#F5F3EE]/70">{L.final.p}</p>
            <a href="#planos" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#8FA69A] px-7 py-4 text-base font-bold text-[#10191C] transition hover:bg-[#A3B8AD]">
              {L.final.cta} <ArrowRight size={18} />
            </a>
            {upsell && (
              <p className="mt-8 text-sm text-muted">
                {L.final.later}
                {declineUrl && (
                  <>
                    {" "}
                    <a href={declineUrl} className="font-semibold text-ink-2 underline underline-offset-2">{L.final.decline}</a>
                  </>
                )}
              </p>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted sm:flex-row">
          <Logo size={24} />
          <p>© {new Date().getFullYear()} Nivela 3D · {L.footer}</p>
        </div>
      </footer>
    </div>
  );
}
