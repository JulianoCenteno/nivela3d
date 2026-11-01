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
  Smartphone,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Logo, LogoMark } from "@/components/Logo";
import { PhoneCarousel } from "@/components/PhoneCarousel";
import { ThemeToggle } from "@/components/ThemeToggle";
import { CHECKOUT_LINKS } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Nivela 3D — Gestão e precificação para impressão 3D",
  description:
    "Descubra quanto cobrar por cada peça 3D, registre suas vendas e veja quanto realmente sobra no seu bolso. Teste grátis por 7 dias.",
};

const HIDDEN_COSTS = [
  "Filamento",
  "Energia",
  "Desgaste da impressora",
  "Manutenção",
  "Peças que falham",
  "Sua hora de trabalho",
  "Argolas, ímãs, embalagem",
  "Taxa da Shopee e do Mercado Livre",
  "Frete",
];

const PLANS = [
  {
    id: "iniciante" as const,
    name: "Iniciante",
    price: "19,90",
    annual: "R$ 199/ano",
    desc: "Para quem está começando a vender.",
    features: ["Calculadora completa", "1 impressora", "Até 30 produtos", "Registro de vendas e painel de lucro", "Bônus e Clube de Ofertas"],
  },
  {
    id: "profissional" as const,
    name: "Profissional",
    price: "39,90",
    annual: "R$ 399/ano",
    desc: "Para quem já vende todo mês e quer controle total.",
    features: ["Tudo do Iniciante", "Até 5 impressoras", "Até 200 produtos", "Insumos e canais de venda ilimitados", "Relatórios completos", "Pedidos, estoque e orçamentos (em breve)"],
    featured: true,
  },
  {
    id: "empresa" as const,
    name: "Empresa",
    price: "79,90",
    annual: "R$ 799/ano",
    desc: "Para operações com várias máquinas.",
    features: ["Tudo do Profissional", "Até 15 impressoras", "Produtos ilimitados", "Equipe e automações (em breve)", "Suporte prioritário"],
  },
];

const BONUSES = [
  ["Guia Primeiras Vendas 3D", "Como começar a vender suas peças com segurança."],
  ["Checklist de Impressão Sem Desperdício", "Evite erros que jogam filamento e dinheiro fora."],
  ["20 Ideias de Produtos para Vender", "Inspiração por categoria e por público."],
  ["Modelos de Mensagens para Clientes", "Responda orçamentos e acompanhe pedidos sem travar."],
  ["Clube de Ofertas 3D", "Promoções selecionadas de filamentos, peças e ferramentas."],
];

const FAQ = [
  ["Preciso instalar alguma coisa?", "Não. O Nivela 3D funciona direto no navegador, no computador e no celular. É só criar sua conta e começar."],
  ["Funciona com a minha impressora?", "Sim. Funciona com impressoras de filamento (FDM) e de resina. Já trazemos uma lista com os principais modelos — Bambu Lab, Creality, Elegoo, Anycubic, Prusa e outros — com o consumo de energia preenchido."],
  ["Como o preço sugerido é calculado?", "Somamos material, energia, desgaste e manutenção da impressora, uma margem para falhas, sua mão de obra e os insumos da peça. Depois aplicamos a comissão do canal onde você vai vender e a margem de lucro que você escolher."],
  ["Preciso de cartão para testar?", "Não. Você cria a conta e usa grátis por 7 dias. Se gostar, escolhe um plano."],
  ["Meus dados ficam protegidos?", "Sim. Cada conta acessa somente os próprios dados, protegidos por regras de segurança no banco de dados."],
  ["Posso mudar de plano depois?", "Pode. Você começa no plano que fizer sentido hoje e muda quando o negócio crescer."],
];

const SLIDES = [
  { src: "/landing/cel-calculadora.webp", title: "Preço certo na hora", text: "Peso, tempo e canal de venda: o Nivela mostra o preço e o seu lucro." },
  { src: "/landing/cel-painel.webp", title: "Lucro real do mês", text: "Faturamento, taxas, custos e o que sobrou no seu bolso." },
  { src: "/landing/cel-insumos.webp", title: "Insumos na conta", text: "Argola, ímã, embalagem: cada peça com seu custo completo." },
  { src: "/landing/cel-produtos.webp", title: "Catálogo com margem", text: "Veja quais peças dão lucro e quais dão prejuízo." },
  { src: "/landing/cel-vendas.webp", title: "Vendas em segundos", text: "Registre cada venda e o lucro aparece na hora." },
  { src: "/landing/cel-impressoras.webp", title: "Sua impressora na lista", text: "Escolha o modelo e o consumo de energia vem preenchido." },
  { src: "/landing/cel-painel-escuro.webp", title: "Tema claro ou escuro", text: "Do jeito que for mais confortável para você." },
];

const checkout = (id: "iniciante" | "profissional" | "empresa") => CHECKOUT_LINKS[id] || "/cadastro";

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

export default function Landing() {
  return (
    <div className="overflow-x-hidden">
      {/* ---------- Topo ---------- */}
      <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
          <Link href="/" aria-label="Nivela 3D"><Logo size={28} /></Link>
          <nav className="hidden items-center gap-7 text-[15px] font-semibold text-ink-2 md:flex">
            <a href="#como-funciona" className="hover:text-primary">Como funciona</a>
            <a href="#no-celular" className="hover:text-primary">No celular</a>
            <a href="#recursos" className="hover:text-primary">Recursos</a>
            <a href="#planos" className="hover:text-primary">Planos</a>
            <a href="#perguntas" className="hover:text-primary">Perguntas</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/login" className="hidden rounded-xl px-3 py-2 text-[15px] font-semibold text-ink-2 hover:bg-surface-2 sm:block">Entrar</Link>
            <Link href="/cadastro" className="btn-primary px-4 py-2 text-sm sm:text-[15px]">Testar grátis</Link>
          </div>
        </div>
      </header>

      <main>
        {/* ---------- Hero ---------- */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-12 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-semibold text-primary">
              <LogoMark size={16} /> Gestão para quem vende impressão 3D
            </p>
            <h1 className="mt-6 text-[2.5rem] font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.6rem]">
              Você sabe quanto <span className="text-sage">realmente ganha</span> em cada impressão 3D?
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
              Pare de calcular preços no improviso. Com o Nivela 3D você organiza seus custos, descobre o preço certo de cada
              peça e acompanha quanto sobra no seu bolso — tudo em um só lugar.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/cadastro" className="btn-primary px-6 py-3.5 text-base">
                Começar teste grátis de 7 dias <ArrowRight size={18} />
              </Link>
              <a href="#planos" className="btn-ghost px-6 py-3.5 text-base">Ver planos</a>
            </div>
            <p className="mt-4 text-sm text-muted">Sem cartão de crédito no teste · Planos a partir de R$ 19,90/mês</p>
          </div>

          <div className="relative pb-6 pl-[16%]">
            <div className="aspect-[5/4] overflow-hidden rounded-3xl">
              <Image src="/landing/oficina.webp" alt="Empreendedor na oficina conferindo o lucro das peças no celular" width={1536} height={1024} className="h-full w-full object-cover object-[60%_50%]" priority sizes="(min-width: 1024px) 560px, 100vw" />
            </div>
            <div className="absolute bottom-0 left-0 w-[33%] max-w-[210px]">
              <Phone src="/landing/m-calculadora.webp" alt="Calculadora do Nivela 3D no celular mostrando o preço sugerido" />
            </div>
          </div>
        </section>

        {/* ---------- Custos escondidos ---------- */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-14 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">O preço de uma peça é muito mais que o filamento</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted">
              Quando esses custos ficam de fora, a peça que parecia lucrativa pode estar dando prejuízo. O Nivela 3D coloca
              tudo na conta para você.
            </p>
            <ul className="mx-auto mt-8 flex max-w-4xl flex-wrap justify-center gap-2.5">
              {HIDDEN_COSTS.map((c) => (
                <li key={c} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-bg px-4 py-2 text-[15px] font-semibold text-ink-2">
                  <Check size={16} className="text-sage" /> {c}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---------- Como funciona ---------- */}
        <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-20 lg:py-28">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wider text-sage">Como funciona</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Do primeiro cálculo ao lucro do mês em 3 passos</h2>
          </div>
          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.35fr] lg:items-center">
            <ol className="space-y-8">
              {[
                [Printer, "Cadastre sua impressora e seu filamento", "Escolha seu modelo numa lista com as impressoras mais vendidas e informe quanto paga no quilo do filamento. Leva 2 minutos."],
                [Calculator, "Calcule o preço de cada peça", "Informe peso e tempo do fatiador. O Nivela soma todos os custos, aplica a taxa do marketplace e mostra o preço que garante a sua margem."],
                [Receipt, "Registre as vendas e veja o lucro real", "Cada venda entra no painel com taxas, custos e frete descontados. No fim do mês você sabe exatamente quanto sobrou."],
              ].map(([Icon, title, text], i) => {
                const I = Icon as typeof Printer;
                return (
                  <li key={i} className="flex gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-primary">
                      <I size={22} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-sage">Passo {i + 1}</p>
                      <h3 className="text-lg font-bold">{title as string}</h3>
                      <p className="mt-1 leading-relaxed text-muted">{text as string}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <Shot src="/landing/calculadora.webp" alt="Calculadora de preço do Nivela 3D com detalhamento de custos" />
          </div>
        </section>

        {/* ---------- No celular ---------- */}
        <section id="no-celular" className="scroll-mt-20 border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-wider text-sage">No seu celular</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Calcule o preço ali mesmo, do lado da impressora</h2>
              <p className="mt-3 text-lg text-muted">O Nivela 3D foi feito para o celular. Abra no navegador e use como um aplicativo — sem instalar nada.</p>
            </div>
            <div className="mt-12 grid items-start gap-12 lg:grid-cols-[300px_1fr]">
              <div className="mx-auto w-[78%] max-w-[300px] lg:w-full">
                <div className="overflow-hidden rounded-[2.4rem] border-[7px] border-[#182B30] bg-[#182B30] shadow-[0_30px_70px_-20px_rgba(24,43,48,0.55)]">
                  <video
                    src="/landing/demo.mp4"
                    poster="/landing/demo-poster.jpg"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="block aspect-[9/16] w-full rounded-[1.9rem] object-cover"
                    aria-label="Vídeo mostrando o Nivela 3D calculando o preço de uma peça no celular"
                  />
                </div>
                <p className="mt-3 text-center text-sm text-muted">Veja em 15 segundos</p>
              </div>
              <PhoneCarousel slides={SLIDES} />
            </div>
          </div>
        </section>

        {/* ---------- Recursos ---------- */}
        <section id="recursos" className="scroll-mt-20 bg-[#182B30] text-[#F5F3EE]">
          <div className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-wider text-[#8FA69A]">Por dentro do app</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Tudo o que você precisa para cuidar do seu negócio</h2>
              <p className="mt-3 text-lg text-[#F5F3EE]/70">Feito para ser simples: botões grandes, linguagem clara e funciona igual no computador e no celular.</p>
            </div>

            <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
              <div className="dark"><Shot src="/landing/painel-dark.webp" alt="Painel do Nivela 3D com faturamento, taxas, custos e lucro real do mês" /></div>
              <div>
                <LayoutDashboard className="text-[#8FA69A]" />
                <h3 className="mt-3 text-2xl font-bold">Painel do lucro real</h3>
                <p className="mt-2 leading-relaxed text-[#F5F3EE]/70">
                  Faturamento, taxas dos canais, custos e o que realmente sobrou — por mês. Veja quais categorias e produtos dão
                  mais lucro e quais estão dando prejuízo.
                </p>
              </div>
            </div>

            <div className="mt-20 grid items-center gap-10 lg:grid-cols-[1fr_1.4fr]">
              <div className="lg:order-1">
                <Paperclip className="text-[#8FA69A]" />
                <h3 className="mt-3 text-2xl font-bold">Produtos com custo sempre atualizado</h3>
                <p className="mt-2 leading-relaxed text-[#F5F3EE]/70">
                  Cadastre cada peça uma vez, com os insumos que ela usa — argola de chaveiro, ímã, embalagem. Mudou o preço do
                  filamento? Um clique recalcula todo o catálogo.
                </p>
              </div>
              <div className="dark lg:order-2"><Shot src="/landing/produto-insumos.webp" alt="Cadastro de produto com insumos como argola e embalagem" /></div>
            </div>

            <div className="mt-20 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[
                [Printer, "39 impressoras prontas", "Bambu Lab, Creality, Elegoo, Anycubic, Prusa e mais, com consumo de energia preenchido."],
                [Calculator, "Taxas de cada canal", "Cadastre a comissão da Shopee, Mercado Livre ou Elo7 e veja o preço certo para cada um."],
                [Smartphone, "No celular e no computador", "Acesse de qualquer lugar, com tema claro ou escuro."],
                [Sparkles, "Modo simples de usar", "Pensado para quem nunca usou um sistema de gestão."],
              ].map(([Icon, t, d]) => {
                const I = Icon as typeof Printer;
                return (
                  <div key={t as string} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                    <I className="text-[#8FA69A]" size={22} />
                    <p className="mt-3 font-bold">{t as string}</p>
                    <p className="mt-1 text-sm leading-relaxed text-[#F5F3EE]/65">{d as string}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------- Para quem ---------- */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-2 lg:py-28">
          <div className="overflow-hidden rounded-3xl">
            <Image src="/landing/atelie.webp" alt="Empreendedora embalando pedidos de peças impressas em 3D" width={1536} height={1024} className="h-auto w-full" sizes="(min-width: 1024px) 560px, 100vw" />
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-sage">Para quem é</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Do primeiro chaveiro vendido à sua própria fazenda de impressão</h2>
            <ul className="mt-8 space-y-4">
              {[
                ["Está começando", "e quer cobrar o preço certo desde a primeira venda."],
                ["Já vende nos marketplaces", "e quer saber quanto sobra depois das taxas."],
                ["Tem várias impressoras", "e precisa enxergar o resultado de cada produto e categoria."],
              ].map(([b, t]) => (
                <li key={b} className="flex gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary"><Check size={14} /></span>
                  <p className="text-lg leading-relaxed"><b>{b}</b> <span className="text-muted">{t}</span></p>
                </li>
              ))}
            </ul>
            <Link href="/cadastro" className="btn-primary mt-9 px-6 py-3.5 text-base">Quero testar grátis <ArrowRight size={18} /></Link>
          </div>
        </section>

        {/* ---------- Planos ---------- */}
        <section id="planos" className="scroll-mt-20 border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-sage">Planos</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Escolha o plano do tamanho do seu negócio</h2>
              <p className="mt-3 text-lg text-muted">Todos os planos incluem os bônus e o Clube de Ofertas 3D. No plano anual você paga o equivalente a 10 meses.</p>
            </div>
            <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:items-stretch">
              {PLANS.map((p) => (
                <div
                  key={p.id}
                  className={`relative flex flex-col rounded-3xl border p-8 ${p.featured ? "border-2 border-primary bg-bg shadow-[0_30px_70px_-30px_rgba(24,43,48,0.35)] lg:-my-4 lg:py-12" : "border-line bg-bg"}`}
                >
                  {p.featured && (
                    <span className="absolute -top-3.5 left-8 rounded-full bg-primary px-3 py-1 text-xs font-bold text-on-primary">Mais completo</span>
                  )}
                  <p className="text-xl font-extrabold">{p.name}</p>
                  <p className="mt-1 text-muted">{p.desc}</p>
                  <p className="tnum mt-6 flex items-baseline gap-1">
                    <span className="text-lg font-bold text-muted">R$</span>
                    <span className="text-5xl font-extrabold tracking-tight">{p.price}</span>
                    <span className="font-semibold text-muted">/mês</span>
                  </p>
                  <p className="mt-1 text-sm text-muted">ou {p.annual} no plano anual</p>
                  <ul className="mt-7 flex-1 space-y-3">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-2.5 text-[15px]">
                        <Check size={18} className="mt-0.5 shrink-0 text-sage" /> {f}
                      </li>
                    ))}
                  </ul>
                  <a href={checkout(p.id)} className={`mt-8 w-full py-3.5 text-base ${p.featured ? "btn-primary" : "btn-ghost"}`}>
                    Assinar {p.name}
                  </a>
                </div>
              ))}
            </div>
            <p className="mt-10 text-center text-muted">
              Ainda em dúvida? <Link href="/cadastro" className="font-semibold text-primary underline">Teste grátis por 7 dias</Link>, sem cartão.
            </p>
          </div>
        </section>

        {/* ---------- Bônus ---------- */}
        <section className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-sage">Bônus inclusos</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Você não começa sozinho</h2>
              <p className="mt-3 text-lg leading-relaxed text-muted">Materiais para chegar mais rápido às primeiras vendas, liberados em todos os planos enquanto a assinatura estiver ativa.</p>
              <div className="mt-8 rounded-2xl bg-sand-soft p-6">
                <BadgePercent className="text-ink-2" />
                <p className="mt-3 font-bold">Clube de Ofertas 3D</p>
                <p className="mt-1 text-[15px] leading-relaxed text-muted">
                  Um grupo com promoções selecionadas de filamentos, bicos, mesas, ferramentas e acabamento. Poucas mensagens,
                  só o que vale a pena.
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
            <h2 className="text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Perguntas frequentes</h2>
            <div className="mt-10 divide-y divide-line rounded-2xl border border-line bg-bg">
              {FAQ.map(([q, a]) => (
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
              Cada impressão conta.<br />
              <span className="text-[#8FA69A]">Cada lucro também.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-[#F5F3EE]/70">Em poucos minutos você cadastra sua impressora, calcula sua primeira peça e enxerga sua margem.</p>
            <Link href="/cadastro" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#8FA69A] px-7 py-4 text-base font-bold text-[#10191C] transition hover:bg-[#A3B8AD]">
              Começar teste grátis <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 text-sm text-muted sm:flex-row">
          <Logo size={24} />
          <p>© {new Date().getFullYear()} Nivela 3D · Gestão inteligente para impressão 3D</p>
          <ThemeToggle />
        </div>
      </footer>
    </div>
  );
}
