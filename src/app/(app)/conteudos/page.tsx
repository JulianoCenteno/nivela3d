import { BadgePercent, Download, ExternalLink, FileText, Gift, LayoutTemplate, Lock, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { Flash, PageHeader } from "@/components/ui";
import { getContext } from "@/lib/data";
import { checkoutFor, COMBO, comboCheckout, EXTRAS } from "@/lib/extras";

export const metadata = { title: "Meus conteúdos" };

const BONUSES = [
  ["Primeiras Vendas com Lucro", "Como começar a vender suas peças sem deixar dinheiro na mesa."],
  ["Checklist Antidesperdício", "Evite as falhas que jogam filamento, tempo e lucro fora."],
  ["20 Ideias de Produtos para Vender", "Inspiração por categoria e por público."],
  ["Modelos de Mensagens para Clientes", "Respostas rápidas para orçamentos e pedidos."],
];

export default async function ContentsPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const sp = await searchParams;
  const { supabase, plan } = await getContext();
  const { data } = await supabase.from("purchases").select("product").eq("status", "active");
  const owned = new Set((data ?? []).map((p) => p.product as string));
  const activePlan = plan !== "nenhum";
  const missing = EXTRAS.filter((e) => !owned.has(e.code)).length;
  const combo = comboCheckout();

  return (
    <>
      <PageHeader title="Meus conteúdos" description="Seus materiais extras e os bônus da assinatura, tudo em um só lugar." />
      <Flash erro={sp.erro} />

      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <ShoppingBag size={20} className="text-sage" /> Materiais extras
        </h2>
        {missing >= 2 && combo && (
          <div className="mb-5 flex flex-col gap-4 rounded-2xl bg-[#182B30] p-6 text-[#F5F3EE] sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-[#C5B79E]">Combo leve todos</p>
              <p className="mt-1 text-lg font-extrabold">Os 4 materiais extras por um super desconto</p>
              <p className="tnum mt-1 text-[15px] text-[#F5F3EE]/70">
                De <s>{COMBO.fullPrice}</s> por <b className="text-[#F5F3EE]">{COMBO.price}</b>
              </p>
            </div>
            <a href={combo} target="_blank" rel="noopener" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#8FA69A] px-5 py-3 font-bold text-[#10191C] hover:bg-[#A3B8AD]">
              Quero todos <Gift size={18} />
            </a>
          </div>
        )}
        <div className="grid gap-5 md:grid-cols-2">
          {EXTRAS.map((e) => {
            const has = owned.has(e.code);
            const checkout = checkoutFor(e.code);
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
                        <span className="rounded-full bg-primary-soft px-2 py-0.5 text-xs font-bold text-primary">Liberado</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-bold text-muted">
                          <Lock size={12} /> Bloqueado
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
                      <p className="hint">Abre no Canva e cria uma cópia editável na sua conta (é preciso entrar no Canva, que tem plano grátis).</p>
                    )}
                  </div>
                ) : (
                  <div className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-surface-2 p-3 pl-4">
                    <span className="tnum font-extrabold">{e.price}</span>
                    {checkout ? (
                      <a href={checkout} target="_blank" rel="noopener" className="btn-primary px-4 py-2.5 text-sm">
                        Comprar agora
                      </a>
                    ) : (
                      <span className="text-sm font-semibold text-muted">Disponível em breve</span>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
        <p className="mt-4 text-sm text-muted">
          Comprou e ainda aparece bloqueado? A liberação usa o e-mail da compra — confira se é o mesmo desta conta. Pode levar alguns minutos.
        </p>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <Gift size={20} className="text-sage" /> Bônus da assinatura
        </h2>
        {!activePlan && (
          <p className="mb-4 rounded-xl bg-negative-soft px-4 py-3 text-sm font-medium text-negative">
            Os bônus ficam liberados enquanto a assinatura estiver ativa. <Link href="/plano" className="underline">Ver planos</Link>
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/clube" className="card flex items-center gap-4 p-5 transition hover:border-primary">
            <div className="rounded-xl bg-sand-soft p-3 text-ink-2"><BadgePercent size={22} /></div>
            <div>
              <p className="font-bold">Clube de Ofertas 3D</p>
              <p className="text-sm text-muted">Promoções selecionadas de filamentos e ferramentas.</p>
            </div>
          </Link>
          {BONUSES.map(([t, d]) => (
            <div key={t} className="card flex items-center gap-4 p-5">
              <div className="rounded-xl bg-surface-2 p-3 text-muted"><FileText size={22} /></div>
              <div className="min-w-0 flex-1">
                <p className="font-bold">{t}</p>
                <p className="text-sm text-muted">{d}</p>
              </div>
              <span className="shrink-0 rounded-full bg-surface-2 px-2 py-1 text-xs font-bold text-muted">Em breve</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
