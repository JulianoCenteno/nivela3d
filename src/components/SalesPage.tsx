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
import { CHECKOUT_LINKS } from "@/lib/plans";

// Exemplo ilustrativo do Vazamento Invisível de Lucro (valores fictícios).
const LEAK = [
  ["Filamento", 8],
  ["Energia", 2],
  ["Desgaste da máquina", 3],
  ["Tempo de trabalho", 8],
  ["Embalagem", 3],
  ["Taxas de venda", 8],
  ["Perdas e desperdícios", 4],
] as const;

const XRAY = [
  [Search, "Revele", "Identifique os custos que estavam passando despercebidos: energia, desgaste, falhas, sua hora, insumos e taxas — peça por peça."],
  [Calculator, "Precifique", "Simule o preço de venda com a margem que você quer, já com a comissão da Shopee, do Mercado Livre ou de onde você vender."],
  [ShieldCheck, "Proteja", "Registre cada venda com o preço que você cobrou de verdade, a taxa e o frete. Veja na hora se um desconto ou uma taxa comeu sua margem."],
  [TrendingUp, "Evolua", "Descubra quais produtos e categorias deixam mais dinheiro no seu bolso e quais só dão trabalho."],
] as const;

const PLANS = [
  {
    id: "iniciante" as const,
    name: "Iniciante",
    price: "19,90",
    annual: "R$ 199/ano",
    desc: "Pare de precificar no achismo e descubra quanto cobrar.",
    features: ["Raio-X do Lucro 3D completo", "1 impressora", "Até 30 produtos", "Registro de vendas e painel de lucro", "Bônus e Clube de Ofertas"],
  },
  {
    id: "profissional" as const,
    name: "Profissional",
    price: "39,90",
    annual: "R$ 399/ano",
    desc: "Controle seus pedidos, custos e lucros em um só lugar.",
    features: ["Tudo do Iniciante", "Até 5 impressoras", "Até 200 produtos", "Insumos e canais de venda ilimitados", "Relatórios completos", "Orçamentos, pedidos e estoque"],
    featured: true,
  },
  {
    id: "empresa" as const,
    name: "Empresa",
    price: "79,90",
    annual: "R$ 799/ano",
    desc: "Mais controle financeiro e operacional para crescer com segurança.",
    features: ["Tudo do Profissional", "Até 15 impressoras", "Produtos ilimitados", "Equipe com até 5 pessoas", "Link de orçamento: o cliente aprova e vira pedido", "Baixa automática de estoque e alertas de prazo", "Suporte prioritário"],
  },
];

const BONUSES = [
  ["Primeiras Vendas com Lucro", "Como começar a vender suas peças sem deixar dinheiro na mesa."],
  ["Checklist Antidesperdício", "Evite as falhas que jogam filamento, tempo e lucro fora."],
  ["20 Ideias de Produtos para Vender", "Inspiração por categoria e por público."],
  ["Modelos de Mensagens para Clientes", "Responda orçamentos e acompanhe pedidos sem travar."],
  ["Clube de Ofertas 3D", "Promoções selecionadas de filamentos, peças e ferramentas."],
];

const UPSELL_FAQ = [
  ["Essa assinatura é separada da compra que acabei de fazer?", "Sim. O acesso do produto que você acabou de comprar chega no seu e-mail normalmente. O Nivela 3D é um aplicativo à parte, com conta própria, para você calcular o custo e o lucro das peças que imprimir."],
];

const FAQ = [
  ["Preciso instalar alguma coisa?", "Não. O Nivela 3D funciona direto no navegador, no computador e no celular. É só criar sua conta e começar."],
  ["Funciona com a minha impressora?", "Sim. Funciona com impressoras de filamento (FDM) e de resina. Já trazemos uma lista com os principais modelos — Bambu Lab, Creality, Elegoo, Anycubic, Prusa e outros — com o consumo de energia preenchido."],
  ["O que é o Raio-X do Lucro 3D?", "É o método do Nivela 3D para enxergar quanto realmente sobra em cada impressão: revelar todos os custos da peça, precificar com a margem certa, conferir o lucro real de cada venda e descobrir quais produtos valem a pena."],
  ["Como o preço sugerido é calculado?", "Somamos material, energia, desgaste e manutenção da impressora, uma margem para falhas, sua mão de obra e os insumos da peça. Depois aplicamos a comissão do canal onde você vai vender e a margem de lucro que você escolher."],
  ["Como recebo o acesso?", "Logo depois do pagamento você recebe o link para criar sua conta com o mesmo e-mail da compra. O plano é liberado na hora."],
  ["Tem garantia?", "Sim. Você tem 7 dias de garantia: se não gostar, pede o reembolso e recebe o valor de volta."],
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

const checkout = (id: "iniciante" | "profissional" | "empresa") => CHECKOUT_LINKS[id] || "#planos";

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

export function SalesPage({ upsell = false, declineUrl }: { upsell?: boolean; declineUrl?: string }) {
  return (
    <div className="overflow-x-hidden">
      {upsell && (
        <div className="bg-[#182B30] px-5 py-3 text-center text-[15px] text-[#F5F3EE]">
          <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#8FA69A] align-[-3px] text-[#10191C]"><Check size={13} strokeWidth={3} /></span>
          <b>Compra confirmada!</b> Seu acesso já está a caminho do seu e-mail. <span className="text-[#C5B79E]">Antes de ir para o seu acesso, veja isto.</span>
          {declineUrl && (
            <a href={declineUrl} className="ml-2 whitespace-nowrap font-semibold text-[#F5F3EE]/70 underline underline-offset-2 hover:text-[#F5F3EE]">Ir para o meu acesso</a>
          )}
        </div>
      )}
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
            {!upsell && <Link href="/login" className="hidden rounded-xl px-3 py-2 text-[15px] font-semibold text-ink-2 hover:bg-surface-2 sm:block">Entrar</Link>}
            <a href="#planos" className="btn-primary px-4 py-2 text-sm sm:text-[15px]">Assinar agora</a>
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
                  <LogoMark size={16} /> Para quem acabou de garantir os arquivos
                </p>
                <h1 className="mt-6 text-[2.5rem] font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.6rem]">
                  Você já tem os arquivos. Agora descubra <span className="text-sage">quanto realmente sobra</span> em cada peça que imprimir.
                </h1>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                  Bons modelos são só metade do caminho. A outra metade é cobrar o preço certo. Com o Raio-X do Lucro 3D você
                  soma filamento, energia, desgaste, falhas, sua hora e as taxas de venda, e vê o lucro real antes de aceitar
                  qualquer pedido.
                </p>
              </>
            ) : (
              <>
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-sm font-semibold text-primary">
                <LogoMark size={16} /> Raio-X do Lucro 3D
              </p>
              <h1 className="mt-6 text-[2.5rem] font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.6rem]">
                Sua impressora 3D pode estar <span className="text-sage">vendendo muito e lucrando pouco.</span> E você nem percebeu.
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
                Descubra quanto realmente sobra em cada impressão e pare de definir seus preços no achismo. Com o Raio-X do
                Lucro 3D você encontra os custos escondidos, cobra com segurança e vê quais peças realmente compensam.
              </p>
              </>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="#planos" className="btn-primary px-6 py-3.5 text-base">
                Quero descobrir meu lucro real <ArrowRight size={18} />
              </a>
              <a href="#como-funciona" className="btn-ghost px-6 py-3.5 text-base">Como funciona</a>
            </div>
            <p className="mt-4 text-sm text-muted">A partir de R$ 19,90/mês · 7 dias de garantia · Acesso imediato</p>
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

        {/* ---------- Big Idea + Vazamento Invisível de Lucro ---------- */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-[1fr_1.05fr] lg:py-24">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-sage">A verdade que pouca gente fala</p>
              <h2 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight sm:text-[2.6rem]">Vender mais não significa lucrar mais.</h2>
              <p className="mt-5 text-lg leading-relaxed text-muted">
                O segredo não é só imprimir mais peças. É saber quanto realmente sobra em cada venda. A maioria calcula o
                filamento e esquece o resto — e é aí que o dinheiro escapa sem ninguém ver.
              </p>
              <div className="mt-7 rounded-2xl border border-line bg-bg p-6">
                <p className="text-sm font-bold uppercase tracking-wider text-[#B4533C] dark:text-[#E08A72]">O problema tem nome</p>
                <p className="mt-1 text-xl font-extrabold">Vazamento Invisível de Lucro 3D</p>
                <p className="mt-2 leading-relaxed text-muted">
                  É todo o dinheiro que fica de fora da conta: energia, desgaste da máquina, peças que falham, sua hora de
                  trabalho, argolas e embalagem, taxa do marketplace. Cada item parece pequeno. Somados, eles decidem se você
                  está lucrando ou só trabalhando de graça.
                </p>
              </div>
            </div>

            <div className="card p-6 sm:p-8">
              <p className="text-sm font-semibold text-muted">Exemplo: uma peça vendida por</p>
              <p className="tnum text-4xl font-extrabold tracking-tight">R$ 50,00</p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-surface-2 p-4">
                  <p className="text-sm font-semibold text-muted">Quem só conta o filamento acha que ganha</p>
                  <p className="tnum mt-1 text-2xl font-extrabold text-muted line-through decoration-2">R$ 42,00</p>
                </div>
                <div className="rounded-xl bg-primary p-4 text-on-primary">
                  <p className="text-sm font-semibold opacity-80">O lucro real é</p>
                  <p className="tnum mt-1 text-2xl font-extrabold">R$ 14,00</p>
                </div>
              </div>
              <ul className="mt-6 divide-y divide-line">
                {LEAK.map(([label, value]) => (
                  <li key={label} className="flex items-center gap-3 py-2.5 text-[15px]">
                    <span className="flex-1 font-semibold text-ink-2">{label}</span>
                    <span className="h-2 rounded-full bg-sage/70" style={{ width: `${value * 9}px` }} />
                    <span className="tnum w-20 text-right font-bold">R$ {value.toFixed(2).replace(".", ",")}</span>
                  </li>
                ))}
                <li className="flex items-center justify-between py-3 font-extrabold">
                  <span>Custo real da peça</span>
                  <span className="tnum">R$ 36,00</span>
                </li>
              </ul>
              <p className="mt-3 text-xs text-muted">Valores fictícios, só para ilustrar. No Nivela você vê os números das suas peças.</p>
            </div>
          </div>
        </section>

        {/* ---------- Frase de autoridade ---------- */}
        <section className="mx-auto max-w-4xl px-5 pt-20 text-center lg:pt-24">
          <p className="text-2xl font-extrabold leading-snug tracking-tight sm:text-3xl">
            “Quem leva a impressão 3D a sério não trabalha no achismo.{" "}
            <span className="text-sage">Trabalha com números.”</span>
          </p>
        </section>

        {/* ---------- Raio-X do Lucro 3D (mecanismo) ---------- */}
        <section id="como-funciona" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-16 lg:py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wider text-sage">A solução</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Raio-X do Lucro 3D</h2>
            <p className="mt-3 text-lg leading-relaxed text-muted">
              Não é só uma calculadora. É o método do Nivela 3D que acompanha a peça do orçamento até a venda e mostra, em
              números, quanto ficou no seu bolso. Quatro etapas:
            </p>
          </div>
          <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.35fr] lg:items-center">
            <ol className="space-y-7">
              {XRAY.map(([Icon, title, text], i) => {
                const I = Icon as typeof Printer;
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
            <Shot src="/landing/calculadora.webp" alt="Raio-X do Lucro 3D: custo completo da peça, preço sugerido e lucro" />
          </div>
          <div className="mt-14 grid gap-4 rounded-3xl border border-line bg-surface p-6 sm:grid-cols-3 sm:p-8">
            {[
              [Printer, "Cadastre impressora e filamento", "Escolha seu modelo numa lista com 39 impressoras. Leva 2 minutos."],
              [Calculator, "Faça o Raio-X da peça", "Peso e tempo do fatiador: o Nivela revela o custo completo e o preço certo."],
              [Receipt, "Registre as vendas", "Veja o lucro real do mês, já com taxas, custos e frete descontados."],
            ].map(([Icon, t, d], i) => {
              const I = Icon as typeof Printer;
              return (
                <div key={t as string} className="flex gap-3">
                  <I size={20} className="mt-0.5 shrink-0 text-sage" />
                  <div>
                    <p className="font-bold">Passo {i + 1}: {t as string}</p>
                    <p className="text-[15px] text-muted">{d as string}</p>
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
              <p className="text-sm font-bold uppercase tracking-wider text-sage">No seu celular</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">O Raio-X ali mesmo, do lado da impressora</h2>
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
        <section id="recursos" className="scroll-mt-20 border-t border-line">
          <div className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
            <div className="max-w-2xl">
              <p className="text-sm font-bold uppercase tracking-wider text-sage">Por dentro do app</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Tudo para fechar o vazamento e cuidar do seu lucro</h2>
              <p className="mt-3 text-lg text-muted">Feito para ser simples: botões grandes, linguagem clara e funciona igual no computador e no celular.</p>
            </div>

            <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1.4fr_1fr]">
              <div><Shot src="/landing/painel.webp" alt="Painel do Nivela 3D com faturamento, taxas, custos e lucro real do mês" /></div>
              <div>
                <LayoutDashboard className="text-sage" />
                <h3 className="mt-3 text-2xl font-bold">Painel do lucro real</h3>
                <p className="mt-2 leading-relaxed text-muted">
                  Faturamento, taxas dos canais, custos e o que realmente sobrou — por mês. Veja quais categorias e produtos dão
                  mais lucro e quais estão dando prejuízo.
                </p>
              </div>
            </div>

            <div className="mt-20 grid items-center gap-10 lg:grid-cols-[1fr_1.4fr]">
              <div className="lg:order-1">
                <Paperclip className="text-sage" />
                <h3 className="mt-3 text-2xl font-bold">Produtos com custo sempre atualizado</h3>
                <p className="mt-2 leading-relaxed text-muted">
                  Cadastre cada peça uma vez, com os insumos que ela usa — argola de chaveiro, ímã, embalagem. Mudou o preço do
                  filamento? Um clique recalcula todo o catálogo.
                </p>
              </div>
              <div className="lg:order-2"><Shot src="/landing/produto-insumos.webp" alt="Cadastro de produto com insumos como argola e embalagem" /></div>
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
                  <div key={t as string} className="rounded-2xl border border-line bg-bg p-6">
                    <I className="text-sage" size={22} />
                    <p className="mt-3 font-bold">{t as string}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{d as string}</p>
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
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Para quem quer transformar impressão 3D em negócio de verdade</h2>
            <ul className="mt-8 space-y-4">
              {[
                ["Está começando", "e quer cobrar o preço certo desde a primeira venda."],
                ["Já vende nos marketplaces", "e quer saber quanto sobra depois das taxas."],
                ["Pensa em comprar outra impressora", "e quer saber antes se está lucrando bem com as que já tem."],
              ].map(([b, t]) => (
                <li key={b} className="flex gap-3">
                  <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary"><Check size={14} /></span>
                  <p className="text-lg leading-relaxed"><b>{b}</b> <span className="text-muted">{t}</span></p>
                </li>
              ))}
            </ul>
            <a href="#planos" className="btn-primary mt-9 px-6 py-3.5 text-base">Fazer o Raio-X das minhas peças <ArrowRight size={18} /></a>
          </div>
        </section>

        {/* ---------- Planos ---------- */}
        <section id="planos" className="scroll-mt-20 border-t border-line bg-surface">
          <div className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-wider text-sage">Planos</p>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">Comece a cuidar dos seus lucros a partir de R$ 19,90/mês</h2>
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
              Todos os planos têm <b className="text-ink">7 dias de garantia</b>: se não gostar, você pede o reembolso.
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
              Sua impressora produz peças.<br />
              <span className="text-[#8FA69A]">O Nivela ajuda você a transformar isso em lucro.</span>
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-[#F5F3EE]/70">Em poucos minutos você faz o Raio-X da sua primeira peça e descobre quanto realmente sobra. Cada impressão conta. Cada lucro também.</p>
            <a href="#planos" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#8FA69A] px-7 py-4 text-base font-bold text-[#10191C] transition hover:bg-[#A3B8AD]">
              Quero descobrir meu lucro real <ArrowRight size={18} />
            </a>
            {upsell && (
              <p className="mt-8 text-sm text-muted">
                Não quer agora? Tudo bem: o acesso da sua compra chega no seu e-mail normalmente.
                {declineUrl && (
                  <>
                    {" "}
                    <a href={declineUrl} className="font-semibold text-ink-2 underline underline-offset-2">Não, obrigado. Ir para o meu acesso</a>
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
          <p>© {new Date().getFullYear()} Nivela 3D · Gestão inteligente para impressão 3D</p>
        </div>
      </footer>
    </div>
  );
}
