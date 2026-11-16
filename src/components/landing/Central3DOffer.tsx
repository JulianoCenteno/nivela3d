import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  Boxes,
  Calculator,
  Check,
  ChevronDown,
  ClipboardList,
  Clock,
  LayoutDashboard,
  Lock,
  Receipt,
  ShieldCheck,
  Target,
  Wallet,
  X,
} from "lucide-react";
import Image from "next/image";
import { Logo } from "@/components/Logo";
import { MetaPixel } from "@/components/MetaPixel";
import landing2 from "@/i18n/messages/landing2";
import { NivoDemo } from "@/components/landing/NivoDemo";
import { ProfitCalc } from "@/components/landing/ProfitCalc";
import { Countdown } from "@/components/landing/Countdown";
import { FloatingNivo } from "@/components/landing/FloatingNivo";
import { NivoAvatar } from "@/components/NivoAvatar";

/** Checkouts (Digital Hub) das ofertas exclusivas para quem comprou a Central 3D. */
export const C3D_UPSELL = "https://appdigitalhub.com.br/c/4DFFFC24";
export const C3D_DOWNSELL = "https://appdigitalhub.com.br/c/291E7628";

const TOOL_TONES = ["bg-primary-soft text-primary", "bg-blue-soft text-blue", "bg-amber-soft text-amber", "bg-rose-soft text-rose", "bg-violet-soft text-violet", "bg-teal-soft text-teal", "bg-amber-soft text-amber", "bg-blue-soft text-blue", "bg-primary-soft text-primary"];
const TOOL_ICONS = [LayoutDashboard, Calculator, Receipt, Wallet, Target, BarChart3, Boxes, ClipboardList, Bot];

/** Checkouts em dólar (STL Católico em inglês). */
export const EN_UPSELL = "https://appdigitalhub.com.br/c/60048F74";
export const EN_DOWNSELL = "https://appdigitalhub.com.br/c/814AC7AC";

const TXT = {
  pt: {
    waitUp: "⚠️ ESPERE! Seu pedido ainda não terminou. Não feche esta página.",
    waitDown: "⏳ ÚLTIMA CHANCE: esta oferta não vai aparecer de novo.",
    stepApproved: "Compra aprovada", stepUp: "Oferta exclusiva", stepDown: "Última oferta", stepAccess: "Acesso",
    tag: "Oferta exclusiva para quem acabou de comprar",
    h1a: "Você já tem os arquivos. Agora descubra ", h1b: "quanto realmente lucra", h1c: " com cada peça.",
    heroP: "O Nivela 3D calcula o preço certo, controla vendas, despesas e estoque, mostra sua meta do mês e ainda tem o Nivo, um assistente que responde com os seus números.",
    once: "Pagamento único · acesso vitalício", heroCta: "Quero aproveitar", dashAlt: "Painel financeiro do Nivela 3D",
    downH1a: "Você recusou… então vou te fazer uma proposta que ", downH1b: "não vou repetir.",
    downP: "O mesmo Nivela 3D Completo, com todas as ferramentas e acesso vitalício, por menos que um rolo de filamento.",
    from: "De", forOnly: "por apenas", oneTime: "pagamento único", expires: "Expira em",
    direct: "Deixa eu ser direto", ifClose: "Se fechar esta página, isso continua acontecendo:",
    calcCta: "Quero parar de perder dinheiro", videoAlt: "Vídeo do Nivela 3D no celular",
    sameKicker: "Mesmo produto completo", sameH2: "Nada foi tirado. Só o preço caiu.",
    colWhat: "O que você recebe", colPrev: "Oferta anterior", colNow: "Agora", guar7: "7 dias de garantia", price: "Preço",
    offerExpires: "Esta oferta expira em", boxUp: "Oferta exclusiva", boxDown: "Última chance", boxTitle: "Nivela 3D Completo · vitalício",
    total: "Valor total:", today: "Hoje, só nesta página:", noMonthly: "Pagamento único · sem mensalidade",
    secure: "Pagamento seguro · acesso imediato no seu e-mail",
    guarH: "Garantia incondicional de 7 dias",
    guarP: "Use o Nivela 3D por uma semana. Se não descobrir pelo menos uma peça que estava vendendo no prejuízo, peça o reembolso e devolvemos 100% do valor. Sem perguntas.",
    faqH: "Perguntas frequentes",
    finalA: "Cada impressão conta.", finalB: "Cada lucro também.",
    finalP: (v: string) => `Leve o Nivela 3D Completo hoje por ${v}, pagamento único.`,
    cta: (v: string) => `SIM! QUERO O NIVELA 3D POR ${v}`,
    declineUp: "Não, obrigado. Prefiro continuar calculando meus preços no chute.",
    declineDown: "Vou recusar esta oferta para sempre.",
    stack: [
      ["Nivela 3D Completo com acesso vitalício", 97],
      ["Assistente Nivo com os seus números", 37],
      ["Metas, relatórios mensais e exportação CSV", 27],
      ["Controle de despesas e estoque de filamento", 27],
      ["Todas as atualizações futuras", 9],
    ] as [string, number][],
    faq: [
      ["É assinatura?", "Não. É pagamento único, com acesso vitalício ao Nivela 3D Completo. Sem mensalidade."],
      ["Preciso instalar alguma coisa?", "Não. Funciona no navegador do computador, do tablet e do celular. Você recebe o acesso no e-mail da compra."],
      ["Serve para quem está começando?", "Sim. Você cadastra a impressora e o filamento em 2 minutos e já descobre o preço certo das suas peças."],
      ["Funciona com qualquer impressora?", "Sim. Tem uma lista com os modelos mais usados (Bambu Lab, Creality, Elegoo, Anycubic, Prusa…) e você pode cadastrar qualquer outra."],
      ["E se eu não gostar?", "Você tem 7 dias de garantia. Se não fizer sentido para você, devolvemos 100% do valor."],
    ] as [string, string][],
  },
  en: {
    waitUp: "⚠️ WAIT! Your order isn't complete yet. Don't close this page.",
    waitDown: "⏳ LAST CHANCE: this offer won't show up again.",
    stepApproved: "Purchase approved", stepUp: "Exclusive offer", stepDown: "Final offer", stepAccess: "Access",
    tag: "Exclusive offer for new customers",
    h1a: "You already have the files. Now find out ", h1b: "how much you really make", h1c: " on every print.",
    heroP: "Nivela 3D calculates the right price, tracks sales, expenses and stock, shows your monthly goal, and comes with Nivo, an assistant that answers with your own numbers.",
    once: "One-time payment · lifetime access", heroCta: "Claim this offer", dashAlt: "Nivela 3D financial dashboard",
    downH1a: "You said no… so here's an offer ", downH1b: "I won't repeat.",
    downP: "The same Nivela 3D Complete, every tool and lifetime access, for less than a spool of filament.",
    from: "From", forOnly: "for only", oneTime: "one-time payment", expires: "Expires in",
    direct: "Let me be direct", ifClose: "If you close this page, this keeps happening:",
    calcCta: "I want to stop losing money", videoAlt: "Nivela 3D on a phone",
    sameKicker: "Same complete product", sameH2: "Nothing was removed. Only the price dropped.",
    colWhat: "What you get", colPrev: "Previous offer", colNow: "Now", guar7: "7-day guarantee", price: "Price",
    offerExpires: "This offer expires in", boxUp: "Exclusive offer", boxDown: "Last chance", boxTitle: "Nivela 3D Complete · lifetime",
    total: "Total value:", today: "Today, on this page only:", noMonthly: "One-time payment · no subscription",
    secure: "Secure payment · instant access by email",
    guarH: "7-day unconditional guarantee",
    guarP: "Use Nivela 3D for a week. If you don't find at least one piece you were selling at a loss, ask for a refund and we'll return 100% of your money. No questions asked.",
    faqH: "Frequently asked questions",
    finalA: "Every print counts.", finalB: "Every profit too.",
    finalP: (v: string) => `Get Nivela 3D Complete today for ${v}, one-time payment.`,
    cta: (v: string) => `YES! I WANT NIVELA 3D FOR ${v}`,
    declineUp: "No thanks. I'd rather keep guessing my prices.",
    declineDown: "I'll pass on this offer forever.",
    stack: [
      ["Nivela 3D Complete with lifetime access", 47],
      ["Nivo assistant with your own numbers", 19],
      ["Goals, monthly reports and CSV export", 14],
      ["Expense tracking and filament stock", 12],
      ["All future updates", 5],
    ] as [string, number][],
    faq: [
      ["Is it a subscription?", "No. It's a one-time payment with lifetime access to Nivela 3D Complete. No monthly fees."],
      ["Do I need to install anything?", "No. It works in the browser on computer, tablet and phone. You get access by email right after purchase."],
      ["Is it good for beginners?", "Yes. Add your printer and filament in 2 minutes and you'll see the right price for your pieces."],
      ["Does it work with any printer?", "Yes. There's a list of the most popular models (Bambu Lab, Creality, Elegoo, Anycubic, Prusa…) and you can add any other."],
      ["What if I don't like it?", "You have a 7-day guarantee. If it doesn't work for you, we refund 100%."],
    ] as [string, string][],
  },
};

function Shot({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_30px_80px_-30px_rgba(24,43,48,0.35)]">
      <div className="flex items-center gap-1.5 border-b border-line bg-surface-2 px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
        <span className="h-2.5 w-2.5 rounded-full bg-line" />
      </div>
      <Image src={src} alt={alt} width={2880} height={1800} className="h-auto w-full" sizes="(min-width: 1024px) 900px, 100vw" />
    </div>
  );
}

/**
 * Upsell (R$ 29,90) e downsell (R$ 16,90) do Nivela 3D para quem acabou de comprar a Central 3D.
 * Estrutura: aviso → dores → solução → Nivo → calculadora → ferramentas → antes/depois → oferta → garantia → FAQ.
 */
export function Central3DOffer({ variant, declineUrl, acceptUrl, locale = "pt" }: { variant: "up" | "down"; declineUrl?: string; acceptUrl?: string; locale?: "pt" | "en" }) {
  const up = variant === "up";
  const en = locale === "en";
  const T = TXT[locale];
  const A = en ? "/landing/en" : "/landing";
  const N = landing2[locale];
  const brl = (v: number) => v.toLocaleString(en ? "en-US" : "pt-BR", { style: "currency", currency: en ? "USD" : "BRL" });
  const price = en ? (up ? 19 : 9) : up ? 29.9 : 16.9;
  const from = en ? (up ? 97 : 19) : up ? 197 : 29.9;
  const off = Math.round((1 - price / from) * 100);
  // Dentro do funil do Digital Hub (página externa), os botões usam os links da própria etapa:
  // "Sim, quero" cobra em 1 clique (cartão) ou gera Pix; "Não, obrigado" segue para o downsell/acesso.
  const href = acceptUrl ?? (en ? (up ? EN_UPSELL : EN_DOWNSELL) : up ? C3D_UPSELL : C3D_DOWNSELL);
  const decline = acceptUrl
    ? declineUrl
    : up
      ? `${en ? "/offer3d/last-chance" : "/central3d/ultima-chance"}${declineUrl ? `?volta=${encodeURIComponent(declineUrl)}` : ""}`
      : declineUrl;
  const declineText = up ? T.declineUp : T.declineDown;
  const total = T.stack.reduce((a, [, v]) => a + v, 0);

  const Cta = ({ className = "" }: { className?: string }) => (
    <a href={href} className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2F8F5B] px-6 py-5 text-lg font-extrabold text-white shadow-[0_14px_30px_-10px_rgba(47,143,91,0.7)] transition hover:bg-[#287D4F] sm:text-xl ${className}`}>
      {T.cta(brl(price))} <ArrowRight size={22} />
    </a>
  );

  const Decline = () =>
    decline ? (
      <a href={decline} className="mt-4 block text-center text-[15px] text-muted underline underline-offset-4 hover:text-ink">
        {declineText}
      </a>
    ) : null;

  return (
    <div className="overflow-x-hidden">
      <MetaPixel page="upsell" />
      <FloatingNivo text={N.nivo.floatText} cta={N.nivo.floatCta} href="#oferta" />

      {/* ---------- Aviso ---------- */}
      <div className="bg-[#B4372B] px-5 py-3 text-center text-[15px] font-bold text-white">
        {up ? (
          <>{T.waitUp}</>
        ) : (
          <>{T.waitDown}</>
        )}
      </div>
      <div className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-4xl items-center justify-center gap-2 px-5 py-3 text-xs font-bold sm:gap-4 sm:text-sm">
          <span className="flex items-center gap-1.5 text-positive"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-positive text-white"><Check size={12} strokeWidth={3} /></span>{T.stepApproved}</span>
          <span className="h-px w-6 bg-line sm:w-10" />
          <span className="flex items-center gap-1.5 text-ink"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#B4372B] text-white">2</span>{up ? T.stepUp : T.stepDown}</span>
          <span className="h-px w-6 bg-line sm:w-10" />
          <span className="flex items-center gap-1.5 text-muted"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-2">3</span>{T.stepAccess}</span>
        </div>
      </div>

      <main>
        {/* ---------- Hero ---------- */}
        {up ? (
          <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-10 lg:grid-cols-[1fr_1.05fr] lg:pb-20 lg:pt-16">
            <div>
              <div><Logo size={28} /></div>
              <p className="mt-6 inline-flex rounded-full bg-[#FBE9E6] px-3 py-1.5 text-sm font-bold text-[#B4372B]">{T.tag}</p>
              <h1 className="mt-5 text-[2.3rem] font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
                {T.h1a}<span className="text-sage">{T.h1b}</span>{T.h1c}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
                {T.heroP}
              </p>
              <div className="mt-7 flex flex-wrap items-end gap-3">
                <span className="text-lg text-muted line-through">{brl(from)}</span>
                <span className="tnum text-5xl font-extrabold tracking-tight text-positive">{brl(price)}</span>
                <span className="mb-2 rounded-lg bg-[#B4372B] px-2 py-1 text-sm font-extrabold text-white">{off}% OFF</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-muted">{T.once}</p>
              <a href="#oferta" className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-[#2F8F5B] px-7 py-4 text-base font-extrabold text-white transition hover:bg-[#287D4F]">
                {T.heroCta} <ArrowRight size={18} />
              </a>
            </div>
            <div className="relative pb-10 pt-6">
              <Shot src={`${A}/painel.webp`} alt={T.dashAlt} />
              <div className="absolute -top-1 right-3 rounded-2xl border border-line bg-surface px-4 py-3 shadow-lg">
                <p className="text-xs font-semibold text-muted">{N.badges.profit}</p>
                <p className="tnum text-lg font-extrabold text-positive">{brl(N.badges.profitV)} <span className="text-xs font-bold">↗ {N.badges.profitUp}</span></p>
              </div>
              <div className="absolute bottom-16 right-0 hidden w-44 rounded-2xl border border-line bg-surface px-4 py-3 shadow-lg sm:block">
                <p className="text-xs font-semibold text-muted">{N.badges.goal}</p>
                <p className="tnum text-lg font-extrabold">79%</p>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full w-[79%] rounded-full bg-primary" /></div>
              </div>
              <div className="absolute bottom-0 left-4 flex items-center gap-2 rounded-2xl bg-primary px-4 py-3 text-on-primary shadow-lg">
                <NivoAvatar size={30} />
                <p className="text-sm"><b>{N.badges.nivoQ}</b> {N.badges.nivoA(brl(N.badges.price))}</p>
              </div>
            </div>
          </section>
        ) : (
          <section className="mx-auto max-w-3xl px-5 pb-14 pt-10 text-center lg:pt-16">
            <div className="flex justify-center"><Logo size={28} /></div>
            <h1 className="mt-6 text-[2.2rem] font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              {T.downH1a}<span className="text-[#B4372B]">{T.downH1b}</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted">
              {T.downP}
            </p>
            <div className="mx-auto mt-8 max-w-md rounded-3xl border-2 border-[#2F8F5B] bg-surface p-7 shadow-[0_30px_80px_-30px_rgba(24,43,48,0.35)]">
              <p className="text-sm font-bold uppercase tracking-wider text-muted">{T.from} <span className="line-through">{brl(from)}</span> {T.forOnly}</p>
              <p className="tnum mt-1 text-6xl font-extrabold tracking-tight text-positive">{brl(price)}</p>
              <p className="mt-2 inline-flex rounded-lg bg-[#B4372B] px-2 py-1 text-sm font-extrabold text-white">{off}% OFF · {T.oneTime}</p>
              <p className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-ink-2"><Clock size={16} className="text-[#B4372B]" /> {T.expires} <Countdown storageKey="c3d-down" minutes={10} /></p>
              <Cta className="mt-5 !text-base sm:!text-lg" />
              <Decline />
            </div>
          </section>
        )}

        {/* ---------- Dores ---------- */}
        <section className="border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-[#B4372B]">{up ? N.pains.kicker : T.direct}</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{up ? N.pains.h2 : T.ifClose}</h2>
            </div>
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(up ? N.pains.items : N.pains.items.slice(0, 3)).map(([b, t]) => (
                <div key={b} className="rounded-2xl border border-line bg-bg p-6">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-negative-soft text-negative"><AlertTriangle size={20} /></span>
                  <p className="mt-4 text-lg font-bold leading-snug">{b}</p>
                  <p className="mt-1 leading-relaxed text-muted">{t}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary px-5 py-12 text-center text-on-primary">
          <p className="mx-auto max-w-4xl text-2xl font-extrabold leading-snug tracking-tight sm:text-3xl">
            “{N.banner.a} <span className="opacity-75">{N.banner.b}</span>”
          </p>
        </section>

        {up && (
          <>
            {/* ---------- Solução ---------- */}
            <section className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-bold uppercase tracking-wider text-sage">{N.solution.kicker}</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{N.solution.h2}</h2>
                <p className="mt-3 text-lg text-muted">{N.solution.p}</p>
              </div>
              {N.solution.blocks.map(([t, d], i) => (
                <div key={t} className="mt-14 grid items-center gap-10 lg:mt-20 lg:grid-cols-[1.4fr_1fr]">
                  <div className={i % 2 ? "lg:order-2" : ""}><Shot src={`${A}/${["painel", "metas", "relatorios"][i]}.webp`} alt={t} /></div>
                  <div className={i % 2 ? "lg:order-1" : ""}>
                    <span className="tnum text-sm font-extrabold text-sage">0{i + 1}</span>
                    <h3 className="mt-2 text-2xl font-bold sm:text-3xl">{t}</h3>
                    <p className="mt-3 text-lg leading-relaxed text-muted">{d}</p>
                  </div>
                </div>
              ))}
            </section>

            {/* ---------- Nivo ---------- */}
            <section className="border-t border-line bg-surface">
              <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1fr_1.1fr] lg:py-24">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wider text-sage">{N.nivo.kicker}</p>
                  <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{N.nivo.h2}</h2>
                  <p className="mt-4 text-lg leading-relaxed text-muted">{N.nivo.p}</p>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/brand/nivo.svg" alt="Nivo, o assistente do Nivela 3D" width={220} height={220} className="mt-6 h-auto w-40 sm:w-52" />
                </div>
                <NivoDemo name={N.nivo.name} online={N.nivo.online} chips={N.nivo.chips} answers={N.nivo.answers} typing={N.nivo.typing} />
              </div>
            </section>

            {/* ---------- Calculadora ---------- */}
            <section className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
              <div className="mx-auto max-w-2xl text-center">
                <p className="text-sm font-bold uppercase tracking-wider text-sage">{N.calc.kicker}</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{N.calc.h2}</h2>
                <p className="mt-3 text-lg text-muted">{N.calc.p}</p>
              </div>
              <div className="mt-10">
                <ProfitCalc labels={{ ...N.calc, perPiece: undefined, cta: T.calcCta }} currency={en ? "USD" : "BRL"} locale={en ? "en-US" : "pt-BR"} perPiece={N.calc.perPiece("{v}")} ctaHref="#oferta" />
              </div>
            </section>

            {/* ---------- Ferramentas ---------- */}
            <section className="border-t border-line bg-surface">
              <div className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
                <div className="text-center">
                  <p className="text-sm font-bold uppercase tracking-wider text-sage">{N.tools.kicker}</p>
                  <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{N.tools.h2}</h2>
                </div>
                <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {N.tools.items.map(([t, d], i) => {
                    const I = TOOL_ICONS[i];
                    return (
                      <div key={t} className="flex gap-4 rounded-2xl border border-line bg-bg p-5">
                        <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TOOL_TONES[i]}`}><I size={21} /></span>
                        <div>
                          <p className="font-bold">{t}</p>
                          <p className="mt-0.5 text-[15px] leading-relaxed text-muted">{d}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ---------- Dispositivos ---------- */}
            <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 lg:grid-cols-[1fr_300px] lg:py-24">
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-sage">{N.devices.kicker}</p>
                <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{N.devices.h2}</h2>
                <p className="mt-3 text-lg text-muted">{N.devices.p}</p>
                <ul className="mt-6 space-y-3">
                  {N.devices.items.map((t) => (
                    <li key={t} className="flex items-center gap-3 text-lg"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-on-primary"><Check size={14} /></span>{t}</li>
                  ))}
                </ul>
              </div>
              <div className="mx-auto w-[70%] max-w-[300px] lg:w-full">
                <div className="overflow-hidden rounded-[2.4rem] border-[7px] border-[#182B30] bg-[#182B30] shadow-[0_30px_70px_-20px_rgba(24,43,48,0.55)]">
                  <video src={`${A}/demo.mp4`} poster={`${A}/demo-poster.jpg`} autoPlay muted loop playsInline preload="metadata" className="block aspect-[9/16] w-full rounded-[1.9rem] object-cover" aria-label={T.videoAlt} />
                </div>
              </div>
            </section>
          </>
        )}

        {/* ---------- Antes e depois / comparação ---------- */}
        <section className="border-t border-line bg-surface">
          <div className="mx-auto max-w-5xl px-5 py-16 lg:py-24">
            {up ? (
              <>
                <div className="mx-auto max-w-2xl text-center">
                  <p className="text-sm font-bold uppercase tracking-wider text-sage">{N.ba.kicker}</p>
                  <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{N.ba.h2}</h2>
                </div>
                <div className="mt-10 grid gap-4 md:grid-cols-2">
                  <div className="rounded-3xl border border-line bg-bg p-6 sm:p-8">
                    <p className="text-lg font-extrabold text-negative">{N.ba.before}</p>
                    <ul className="mt-5 space-y-4">
                      {N.ba.rows.map(([b]) => (
                        <li key={b} className="flex gap-3 text-muted"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-negative-soft text-negative"><X size={14} /></span>{b}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-3xl bg-primary p-6 text-on-primary sm:p-8">
                    <p className="text-lg font-extrabold">{N.ba.after}</p>
                    <ul className="mt-5 space-y-4">
                      {N.ba.rows.map(([, a]) => (
                        <li key={a} className="flex gap-3"><span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20"><Check size={14} /></span>{a}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto max-w-2xl text-center">
                  <p className="text-sm font-bold uppercase tracking-wider text-sage">{T.sameKicker}</p>
                  <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{T.sameH2}</h2>
                </div>
                <div className="mt-10 overflow-hidden rounded-3xl border border-line bg-bg">
                  <div className="grid grid-cols-[1.4fr_1fr_1fr] border-b border-line bg-surface-2 px-5 py-3 text-sm font-bold text-muted">
                    <span>{T.colWhat}</span><span className="text-center">{T.colPrev}</span><span className="text-center text-positive">{T.colNow}</span>
                  </div>
                  {[...T.stack.map(([t]) => t), T.guar7].map((t) => (
                    <div key={t} className="grid grid-cols-[1.4fr_1fr_1fr] items-center border-b border-line px-5 py-3.5 text-[15px] last:border-0">
                      <span className="font-semibold">{t}</span>
                      <span className="flex justify-center text-positive"><Check size={18} /></span>
                      <span className="flex justify-center text-positive"><Check size={18} /></span>
                    </div>
                  ))}
                  <div className="grid grid-cols-[1.4fr_1fr_1fr] items-center bg-surface-2 px-5 py-4 font-extrabold">
                    <span>{T.price}</span>
                    <span className="tnum text-center text-muted line-through">{brl(from)}</span>
                    <span className="tnum text-center text-xl text-positive">{brl(price)}</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ---------- Oferta ---------- */}
        <section id="oferta" className="scroll-mt-10 px-5 py-16 lg:py-24">
          <div className="mx-auto max-w-xl overflow-hidden rounded-[2rem] border-2 border-[#2F8F5B] bg-surface shadow-[0_40px_90px_-30px_rgba(24,43,48,0.45)]">
            <div className="flex items-center justify-center gap-2 bg-[#B4372B] px-5 py-3 text-sm font-bold text-white">
              <Clock size={16} /> {T.offerExpires} <Countdown storageKey={`c3d-${variant}`} minutes={up ? 15 : 10} />
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-center text-sm font-bold uppercase tracking-wider text-sage">{up ? T.boxUp : T.boxDown}</p>
              <h2 className="mt-1 text-center text-2xl font-extrabold tracking-tight sm:text-3xl">{T.boxTitle}</h2>
              <ul className="mt-6 divide-y divide-line">
                {T.stack.map(([t, v]) => (
                  <li key={t} className="flex items-center gap-3 py-3 text-[15px]">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-positive/15 text-positive"><Check size={14} /></span>
                    <span className="flex-1 font-semibold">{t}</span>
                    <span className="tnum text-muted line-through">{brl(v)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-2xl bg-bg p-5 text-center">
                <p className="text-muted">{T.total} <span className="tnum line-through">{brl(total)}</span></p>
                <p className="mt-1 text-sm font-semibold text-ink-2">{T.today}</p>
                <p className="tnum text-6xl font-extrabold tracking-tight text-positive">{brl(price)}</p>
                <p className="mt-1 text-sm font-semibold text-muted">{T.noMonthly}</p>
              </div>
              <Cta className="mt-6" />
              <p className="mt-3 flex items-center justify-center gap-2 text-sm text-muted"><Lock size={14} /> {T.secure}</p>
              <Decline />
            </div>
          </div>
        </section>

        {/* ---------- Garantia ---------- */}
        <section className="mx-auto max-w-3xl px-5 pb-16">
          <div className="flex flex-col items-center gap-5 rounded-3xl border border-line bg-surface p-7 text-center sm:flex-row sm:text-left">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary"><ShieldCheck size={40} /></span>
            <div>
              <p className="text-xl font-extrabold">{T.guarH}</p>
              <p className="mt-1 leading-relaxed text-muted">{T.guarP}</p>
            </div>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="border-t border-line bg-surface">
          <div className="mx-auto max-w-3xl px-5 py-16 lg:py-20">
            <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">{T.faqH}</h2>
            <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-bg">
              {T.faq.map(([q, a]) => (
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
        <section className="px-5 py-16">
          <div className="mx-auto max-w-3xl rounded-[2rem] bg-[#182B30] px-6 py-12 text-center text-[#F5F3EE] sm:px-12">
            <h2 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              {T.finalA}<br /><span className="text-[#8FA69A]">{T.finalB}</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-[#F5F3EE]/70">{T.finalP(brl(price))}</p>
            <div className="mx-auto mt-8 max-w-md"><Cta /></div>
            {decline && (
              <a href={decline} className="mt-5 block text-sm text-[#F5F3EE]/60 underline underline-offset-4 hover:text-[#F5F3EE]">{declineText}</a>
            )}
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted sm:flex-row">
          <Logo size={24} />
          <p>© {new Date().getFullYear()} Nivela 3D · suporte@nivela3d.com.br</p>
        </div>
      </footer>
    </div>
  );
}
