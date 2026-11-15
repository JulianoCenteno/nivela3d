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
import { NivoAvatar } from "@/components/NivoAvatar";

/** Checkouts (Digital Hub) das ofertas exclusivas para quem comprou a Central 3D. */
export const C3D_UPSELL = "https://appdigitalhub.com.br/c/E4A58965";
export const C3D_DOWNSELL = "https://appdigitalhub.com.br/c/1078750D";

const N = landing2.pt;
const TOOL_ICONS = [LayoutDashboard, Calculator, Receipt, Wallet, Target, BarChart3, Boxes, ClipboardList, Bot];
const brl = (v: number) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const STACK: [string, number][] = [
  ["Nivela 3D Completo com acesso vitalício", 97],
  ["Assistente Nivo com os seus números", 37],
  ["Metas, relatórios mensais e exportação CSV", 27],
  ["Controle de despesas e estoque de filamento", 27],
  ["Todas as atualizações futuras", 9],
];

const FAQ_UP: [string, string][] = [
  ["É assinatura?", "Não. É pagamento único, com acesso vitalício ao Nivela 3D Completo. Sem mensalidade."],
  ["Preciso instalar alguma coisa?", "Não. Funciona no navegador do computador, do tablet e do celular. Você recebe o acesso no e-mail da compra."],
  ["Serve para quem está começando?", "Sim. Você cadastra a impressora e o filamento em 2 minutos e já descobre o preço certo das suas peças."],
  ["Funciona com qualquer impressora?", "Sim. Tem uma lista com os modelos mais usados (Bambu Lab, Creality, Elegoo, Anycubic, Prusa…) e você pode cadastrar qualquer outra."],
  ["E se eu não gostar?", "Você tem 7 dias de garantia. Se não fizer sentido para você, devolvemos 100% do valor."],
];

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
 * Upsell (R$ 47) e downsell (R$ 17) do Nivela 3D para quem acabou de comprar a Central 3D.
 * Estrutura: aviso → dores → solução → Nivo → calculadora → ferramentas → antes/depois → oferta → garantia → FAQ.
 */
export function Central3DOffer({ variant, declineUrl }: { variant: "up" | "down"; declineUrl?: string }) {
  const up = variant === "up";
  const price = up ? 47 : 17;
  const from = up ? 197 : 47;
  const off = Math.round((1 - price / from) * 100);
  const href = up ? C3D_UPSELL : C3D_DOWNSELL;
  const decline = up
    ? `/central3d/ultima-chance${declineUrl ? `?volta=${encodeURIComponent(declineUrl)}` : ""}`
    : declineUrl;
  const declineText = up
    ? "Não, obrigado. Prefiro continuar calculando meus preços no chute."
    : "Vou recusar esta oferta para sempre.";
  const total = STACK.reduce((a, [, v]) => a + v, 0);

  const Cta = ({ className = "" }: { className?: string }) => (
    <a href={href} className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#2F8F5B] px-6 py-5 text-lg font-extrabold text-white shadow-[0_14px_30px_-10px_rgba(47,143,91,0.7)] transition hover:bg-[#287D4F] sm:text-xl ${className}`}>
      SIM! QUERO O NIVELA 3D POR {brl(price)} <ArrowRight size={22} />
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

      {/* ---------- Aviso ---------- */}
      <div className="bg-[#B4372B] px-5 py-3 text-center text-[15px] font-bold text-white">
        {up ? (
          <>⚠️ ESPERE! Seu pedido ainda não terminou. Não feche esta página.</>
        ) : (
          <>⏳ ÚLTIMA CHANCE: esta oferta não vai aparecer de novo.</>
        )}
      </div>
      <div className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-4xl items-center justify-center gap-2 px-5 py-3 text-xs font-bold sm:gap-4 sm:text-sm">
          <span className="flex items-center gap-1.5 text-positive"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-positive text-white"><Check size={12} strokeWidth={3} /></span>Compra aprovada</span>
          <span className="h-px w-6 bg-line sm:w-10" />
          <span className="flex items-center gap-1.5 text-ink"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#B4372B] text-white">2</span>{up ? "Oferta exclusiva" : "Última oferta"}</span>
          <span className="h-px w-6 bg-line sm:w-10" />
          <span className="flex items-center gap-1.5 text-muted"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-2">3</span>Acesso</span>
        </div>
      </div>

      <main>
        {/* ---------- Hero ---------- */}
        {up ? (
          <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-10 lg:grid-cols-[1fr_1.05fr] lg:pb-20 lg:pt-16">
            <div>
              <div><Logo size={28} /></div>
              <p className="mt-6 inline-flex rounded-full bg-[#FBE9E6] px-3 py-1.5 text-sm font-bold text-[#B4372B]">Só para quem acabou de comprar a Central 3D</p>
              <h1 className="mt-5 text-[2.3rem] font-extrabold leading-[1.08] tracking-tight sm:text-5xl">
                Você já tem os arquivos. Agora descubra <span className="text-sage">quanto realmente lucra</span> com cada peça.
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
                O Nivela 3D calcula o preço certo, controla vendas, despesas e estoque, mostra sua meta do mês e ainda tem o Nivo, um assistente que responde com os seus números.
              </p>
              <div className="mt-7 flex flex-wrap items-end gap-3">
                <span className="text-lg text-muted line-through">{brl(from)}</span>
                <span className="tnum text-5xl font-extrabold tracking-tight text-positive">{brl(price)}</span>
                <span className="mb-2 rounded-lg bg-[#B4372B] px-2 py-1 text-sm font-extrabold text-white">{off}% OFF</span>
              </div>
              <p className="mt-1 text-sm font-semibold text-muted">Pagamento único · acesso vitalício</p>
              <a href="#oferta" className="mt-7 inline-flex items-center gap-2 rounded-2xl bg-[#2F8F5B] px-7 py-4 text-base font-extrabold text-white transition hover:bg-[#287D4F]">
                Quero aproveitar <ArrowRight size={18} />
              </a>
            </div>
            <div className="relative pb-10 pt-6">
              <Shot src="/landing/painel.webp" alt="Painel financeiro do Nivela 3D" />
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
              Você recusou… então vou te fazer uma proposta que <span className="text-[#B4372B]">não vou repetir.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted">
              O mesmo Nivela 3D Completo, com todas as ferramentas e acesso vitalício, por menos que um rolo de filamento.
            </p>
            <div className="mx-auto mt-8 max-w-md rounded-3xl border-2 border-[#2F8F5B] bg-surface p-7 shadow-[0_30px_80px_-30px_rgba(24,43,48,0.35)]">
              <p className="text-sm font-bold uppercase tracking-wider text-muted">De <span className="line-through">{brl(from)}</span> por apenas</p>
              <p className="tnum mt-1 text-6xl font-extrabold tracking-tight text-positive">{brl(price)}</p>
              <p className="mt-2 inline-flex rounded-lg bg-[#B4372B] px-2 py-1 text-sm font-extrabold text-white">{off}% OFF · pagamento único</p>
              <p className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-ink-2"><Clock size={16} className="text-[#B4372B]" /> Expira em <Countdown storageKey="c3d-down" minutes={10} /></p>
              <Cta className="mt-5 !text-base sm:!text-lg" />
              <Decline />
            </div>
          </section>
        )}

        {/* ---------- Dores ---------- */}
        <section className="border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-16 lg:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-[#B4372B]">{up ? N.pains.kicker : "Deixa eu ser direto"}</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{up ? N.pains.h2 : "Se fechar esta página, isso continua acontecendo:"}</h2>
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
                  <div className={i % 2 ? "lg:order-2" : ""}><Shot src={`/landing/${["painel", "metas", "relatorios"][i]}.webp`} alt={t} /></div>
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
                <ProfitCalc labels={{ ...N.calc, perPiece: undefined, cta: "Quero parar de perder dinheiro" }} currency="BRL" locale="pt-BR" perPiece={N.calc.perPiece("{v}")} />
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
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary"><I size={21} /></span>
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
                  <video src="/landing/demo.mp4" poster="/landing/demo-poster.jpg" autoPlay muted loop playsInline preload="metadata" className="block aspect-[9/16] w-full rounded-[1.9rem] object-cover" aria-label="Vídeo do Nivela 3D no celular" />
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
                  <p className="text-sm font-bold uppercase tracking-wider text-sage">Mesmo produto completo</p>
                  <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Nada foi tirado. Só o preço caiu.</h2>
                </div>
                <div className="mt-10 overflow-hidden rounded-3xl border border-line bg-bg">
                  <div className="grid grid-cols-[1.4fr_1fr_1fr] border-b border-line bg-surface-2 px-5 py-3 text-sm font-bold text-muted">
                    <span>O que você recebe</span><span className="text-center">Oferta anterior</span><span className="text-center text-positive">Agora</span>
                  </div>
                  {[...STACK.map(([t]) => t), "7 dias de garantia"].map((t) => (
                    <div key={t} className="grid grid-cols-[1.4fr_1fr_1fr] items-center border-b border-line px-5 py-3.5 text-[15px] last:border-0">
                      <span className="font-semibold">{t}</span>
                      <span className="flex justify-center text-positive"><Check size={18} /></span>
                      <span className="flex justify-center text-positive"><Check size={18} /></span>
                    </div>
                  ))}
                  <div className="grid grid-cols-[1.4fr_1fr_1fr] items-center bg-surface-2 px-5 py-4 font-extrabold">
                    <span>Preço</span>
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
              <Clock size={16} /> Esta oferta expira em <Countdown storageKey={`c3d-${variant}`} minutes={up ? 15 : 10} />
            </div>
            <div className="p-6 sm:p-8">
              <p className="text-center text-sm font-bold uppercase tracking-wider text-sage">{up ? "Oferta exclusiva Central 3D" : "Última chance"}</p>
              <h2 className="mt-1 text-center text-2xl font-extrabold tracking-tight sm:text-3xl">Nivela 3D Completo · vitalício</h2>
              <ul className="mt-6 divide-y divide-line">
                {STACK.map(([t, v]) => (
                  <li key={t} className="flex items-center gap-3 py-3 text-[15px]">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-positive/15 text-positive"><Check size={14} /></span>
                    <span className="flex-1 font-semibold">{t}</span>
                    <span className="tnum text-muted line-through">{brl(v)}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 rounded-2xl bg-bg p-5 text-center">
                <p className="text-muted">Valor total: <span className="tnum line-through">{brl(total)}</span></p>
                <p className="mt-1 text-sm font-semibold text-ink-2">Hoje, só nesta página:</p>
                <p className="tnum text-6xl font-extrabold tracking-tight text-positive">{brl(price)}</p>
                <p className="mt-1 text-sm font-semibold text-muted">Pagamento único · sem mensalidade</p>
              </div>
              <Cta className="mt-6" />
              <p className="mt-3 flex items-center justify-center gap-2 text-sm text-muted"><Lock size={14} /> Pagamento seguro · acesso imediato no seu e-mail</p>
              <Decline />
            </div>
          </div>
        </section>

        {/* ---------- Garantia ---------- */}
        <section className="mx-auto max-w-3xl px-5 pb-16">
          <div className="flex flex-col items-center gap-5 rounded-3xl border border-line bg-surface p-7 text-center sm:flex-row sm:text-left">
            <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary"><ShieldCheck size={40} /></span>
            <div>
              <p className="text-xl font-extrabold">Garantia incondicional de 7 dias</p>
              <p className="mt-1 leading-relaxed text-muted">Use o Nivela 3D por uma semana. Se não descobrir pelo menos uma peça que estava vendendo no prejuízo, peça o reembolso e devolvemos 100% do valor. Sem perguntas.</p>
            </div>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="border-t border-line bg-surface">
          <div className="mx-auto max-w-3xl px-5 py-16 lg:py-20">
            <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Perguntas frequentes</h2>
            <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-bg">
              {FAQ_UP.map(([q, a]) => (
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
              Cada impressão conta.<br /><span className="text-[#8FA69A]">Cada lucro também.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-lg text-[#F5F3EE]/70">Leve o Nivela 3D Completo hoje por {brl(price)}, pagamento único.</p>
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
