import { FileText, Plus } from "lucide-react";
import Link from "next/link";
import { Badge, UpgradeCard } from "@/components/gestao";
import { Empty, Flash, PageHeader } from "@/components/ui";
import { getContext } from "@/lib/data";
import { getQuotes } from "@/lib/gestao-data";
import { itemsTotals, QUOTE_TONE } from "@/lib/orders";
import { hasFeature } from "@/lib/plans";
import { getI18n, getT } from "@/i18n/server";

export async function generateMetadata() {
  return { title: (await getT()).ops.quotes.title };
}

export default async function QuotesPage({ searchParams }: { searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const sp = await searchParams;
  const { plan } = await getContext();
  const { t: tt, fmt } = await getI18n();
  const q_ = tt.ops.quotes;
  const money = fmt.money;
  if (!hasFeature(plan, "gestao")) {
    return (
      <>
        <PageHeader title={q_.title} />
        <UpgradeCard plan="Profissional" title={q_.lockedTitle} text={q_.lockedText} bullets={q_.lockedBullets} />
      </>
    );
  }
  const quotes = await getQuotes();
  const open = quotes.filter((q) => q.status === "aberto" || q.status === "enviado");
  const openValue = open.reduce((a, q) => a + itemsTotals(q.items, q.discount, q.shipping).total, 0);

  return (
    <>
      <PageHeader
        title={q_.title}
        description={q_.desc}
        action={
          <Link href="/orcamentos/novo" className="btn-primary">
            <Plus size={18} /> {q_.new}
          </Link>
        }
      />
      <Flash ok={sp.ok} erro={sp.erro} />
      {quotes.length === 0 ? (
        <Empty icon={<FileText size={28} />} title={q_.emptyTitle} text={q_.emptyText} href="/orcamentos/novo" cta={q_.create} />
      ) : (
        <>
          {open.length > 0 && (
            <p className="mb-4 text-muted">
              {q_.waiting(open.length)} ·{" "}
              <b className="tnum text-ink">{money(openValue)}</b> {q_.negotiating}
            </p>
          )}
          <ul className="card divide-y divide-line">
            {quotes.map((q) => {
              const t = itemsTotals(q.items, q.discount, q.shipping);
              const st = { tone: QUOTE_TONE[q.status], label: tt.gestao.quoteStatus[q.status] };
              return (
                <li key={q.id}>
                  <Link href={`/orcamentos/${q.id}`} className="flex items-center gap-4 px-5 py-4 hover:bg-surface-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">
                        <span className="text-muted">{q_.num(q.number)} · </span>
                        {q.customer_name}
                      </p>
                      <p className="truncate text-sm text-muted">
                        {fmt.short(q.created_at)} · {q.items.map((i) => `${i.qty}× ${i.description}`).join(", ")}
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
