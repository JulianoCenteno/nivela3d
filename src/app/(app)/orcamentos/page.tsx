import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { Badge, UpgradeCard } from "@/components/gestao";
import { Empty, Flash, PageHeader } from "@/components/ui";
import { getContext } from "@/lib/data";
import { money } from "@/lib/format";
import { getQuotes } from "@/lib/gestao-data";
import { itemsTotals, QUOTE_STATUS } from "@/lib/orders";
import { fmtDate } from "@/lib/period";
import { hasFeature } from "@/lib/plans";

export const metadata = { title: "Orçamentos" };

export default async function QuotesPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  const { plan } = await getContext();
  if (!hasFeature(plan, "gestao")) {
    return (
      <>
        <PageHeader title="Orçamentos" />
        <UpgradeCard
          plan="Profissional"
          title="Orçamentos profissionais em segundos"
          text="Monte o orçamento com as peças do seu catálogo, veja quanto vai sobrar e mande pronto para o WhatsApp do cliente."
          bullets={["Preço puxado do Raio-X de cada peça", "Mensagem pronta para o WhatsApp", "Controle de enviados, aprovados e recusados"]}
        />
      </>
    );
  }
  const quotes = await getQuotes();
  const open = quotes.filter((q) => q.status === "aberto" || q.status === "enviado");
  const openValue = open.reduce((a, q) => a + itemsTotals(q.items, q.discount, q.shipping).total, 0);

  return (
    <>
      <PageHeader
        title="Orçamentos"
        description="Monte, envie e acompanhe seus orçamentos até virarem pedido."
        action={
          <Link href="/orcamentos/novo" className="btn-primary">
            <Plus size={18} /> Novo orçamento
          </Link>
        }
      />
      <Flash ok={sp.ok} erro={sp.erro} />
      {quotes.length === 0 ? (
        <Empty icon={<FileText size={28} />} title="Nenhum orçamento ainda" text="Crie o primeiro e mande para o cliente pelo WhatsApp." href="/orcamentos/novo" cta="Criar orçamento" />
      ) : (
        <>
          {open.length > 0 && (
            <p className="mb-4 text-muted">
              {open.length} {open.length === 1 ? "orçamento aguardando" : "orçamentos aguardando"} resposta ·{" "}
              <b className="tnum text-ink">{money(openValue)}</b> em negociação
            </p>
          )}
          <ul className="card divide-y divide-line">
            {quotes.map((q) => {
              const t = itemsTotals(q.items, q.discount, q.shipping);
              const st = QUOTE_STATUS[q.status];
              return (
                <li key={q.id}>
                  <Link href={`/orcamentos/${q.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        <span className="text-muted">nº {q.number} · </span>
                        {q.customer_name}
                      </p>
                      <p className="truncate text-sm text-muted">
                        {fmtDate(q.created_at.slice(0, 10))} · {q.items.map((i) => `${i.qty}× ${i.description}`).join(", ")}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="tnum font-bold">{money(t.total)}</p>
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}
