import { ArrowRight, Link2, MessageCircle, Pencil } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CopyButton } from "@/components/CopyButton";
import { DeleteButton } from "@/components/DeleteButton";
import { Badge, EmpresaHint } from "@/components/gestao";
import { SubmitButton } from "@/components/SubmitButton";
import { Flash, PageHeader } from "@/components/ui";
import { getChannels, getContext, getSettings } from "@/lib/data";
import { getQuote } from "@/lib/gestao-data";
import { itemsTotals, QUOTE_TONE, quoteText, waLink } from "@/lib/orders";
import { hasFeature } from "@/lib/plans";
import { getI18n, getT } from "@/i18n/server";
import { convertQuote, deleteQuote, setQuoteStatus, shareQuote } from "../../gestao-actions";

export async function generateMetadata() {
  return { title: (await getT()).ops.public.meta };
}

export default async function QuotePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [{ plan }, quote, settings, channels, h] = await Promise.all([getContext(), getQuote(id), getSettings(), getChannels(), headers()]);
  if (!quote) notFound();
  const { t: tt, fmt } = await getI18n();
  const q_ = tt.ops.quotes;
  const money = fmt.money;
  const auto = hasFeature(plan, "automacoes");
  const t = itemsTotals(quote.items, quote.discount, quote.shipping);
  const st = { tone: QUOTE_TONE[quote.status], label: tt.gestao.quoteStatus[quote.status] };
  const origin = `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
  const link = quote.public_token && auto ? `${origin}/o/${quote.public_token}` : undefined;
  const text = quoteText(quote, settings.business_name || tt.gestao.quoteText.defaultBusiness, link, tt.gestao.quoteText, money, fmt.short);
  const channel = channels.find((c) => c.id === quote.channel_id);
  const closed = quote.status === "convertido";

  return (
    <>
      <PageHeader
        title={q_.titleN(quote.number)}
        description={`${quote.customer_name} · ${q_.createdOn(fmt.short(quote.created_at))}`}
        action={
          <div className="flex gap-2">
            {!closed && (
              <Link href={`/orcamentos/${id}/editar`} className="btn-ghost">
                <Pencil size={17} /> {tt.common.actions.edit}
              </Link>
            )}
            <DeleteButton id={id} action={deleteQuote} confirmText={q_.removeConfirm} />
          </div>
        }
      />
      <Flash ok={sp.ok} erro={sp.erro} />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="card p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold">{tt.ops.form.items}</h2>
            <Badge tone={st.tone}>{st.label}</Badge>
          </div>
          <ul className="divide-y divide-line">
            {quote.items.map((i, k) => (
              <li key={k} className="flex justify-between gap-4 py-3">
                <span>
                  <b>{i.qty}×</b> {i.description}
                  <span className="block text-sm text-muted">{money(i.unit_price)} {q_.each}</span>
                </span>
                <span className="tnum font-semibold">{money(i.qty * i.unit_price)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-line pt-4 text-[15px]">
            <div className="flex justify-between"><dt className="text-muted">{q_.subtotal}</dt><dd className="tnum">{money(t.subtotal)}</dd></div>
            {quote.discount > 0 && <div className="flex justify-between"><dt className="text-muted">{q_.discount}</dt><dd className="tnum">-{money(quote.discount)}</dd></div>}
            {quote.shipping > 0 && <div className="flex justify-between"><dt className="text-muted">{q_.shipping}</dt><dd className="tnum">{money(quote.shipping)}</dd></div>}
            <div className="flex justify-between pt-1 text-lg font-extrabold"><dt>{q_.total}</dt><dd className="tnum">{money(t.total)}</dd></div>
            {t.cost > 0 && (
              <div className="flex justify-between text-sm text-muted">
                <dt>{q_.costAndLeft}{channel ? ` (${channel.name})` : ""}</dt>
                <dd className="tnum">{money(t.cost)} · {money(t.subtotal - quote.discount - t.cost)}</dd>
              </div>
            )}
          </dl>
          <div className="mt-5 grid gap-1 text-sm text-muted sm:grid-cols-3">
            <p>{tt.ops.form.whatsapp}: <b className="text-ink">{quote.customer_phone || "—"}</b></p>
            <p>{q_.validUntil} <b className="text-ink">{quote.valid_until ? fmt.short(quote.valid_until) : "—"}</b></p>
            <p>{q_.lead} <b className="text-ink">{quote.delivery_days ? q_.days(quote.delivery_days) : "—"}</b></p>
          </div>
          {quote.notes && <p className="mt-4 rounded-xl bg-surface-2 p-3 text-[15px]">{quote.notes}</p>}
        </section>

        <aside className="space-y-4">
          <div className="card space-y-3 p-5">
            <h2 className="font-bold">{q_.send}</h2>
            {auto ? (
              link ? (
                <div className="rounded-xl bg-primary-soft p-3">
                  <p className="flex items-center gap-1.5 text-sm font-bold text-primary"><Link2 size={16} /> {q_.approvalLink}</p>
                  <p className="mt-1 break-all text-sm">{link}</p>
                  <CopyButton text={link} label={q_.copyLink} className="btn-ghost mt-2 w-full" />
                  <p className="hint">{q_.approvalHint}</p>
                </div>
              ) : (
                !closed && (
                  <form action={shareQuote}>
                    <input type="hidden" name="id" value={id} />
                    <SubmitButton className="btn-primary w-full" pendingText={q_.generating}><Link2 size={17} /> {q_.generate}</SubmitButton>
                  </form>
                )
              )
            ) : (
              <EmpresaHint>{q_.approvalUpsell}</EmpresaHint>
            )}
            <a href={waLink(quote.customer_phone, text)} target="_blank" rel="noopener" className="btn-primary w-full">
              <MessageCircle size={17} /> {q_.openWhatsapp}
            </a>
            <CopyButton text={text} label={q_.copyMessage} className="btn-ghost w-full" />
          </div>

          <div className="card space-y-3 p-5">
            <h2 className="font-bold">{q_.answer}</h2>
            {closed && quote.order_id ? (
              <Link href={`/pedidos/${quote.order_id}`} className="btn-primary w-full">
                {q_.seeOrder} <ArrowRight size={17} />
              </Link>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  {(["enviado", "aprovado", "recusado", "aberto"] as const)
                    .filter((s) => s !== quote.status)
                    .slice(0, 3)
                    .map((s) => (
                      <form key={s} action={setQuoteStatus}>
                        <input type="hidden" name="id" value={id} />
                        <input type="hidden" name="status" value={s} />
                        <button className="btn-ghost w-full text-sm">{q_.mark(tt.gestao.quoteStatus[s])}</button>
                      </form>
                    ))}
                </div>
                {auto ? (
                  <form action={convertQuote}>
                    <input type="hidden" name="id" value={id} />
                    <SubmitButton className="btn-primary w-full" pendingText={q_.creatingOrder}>{q_.approvedToOrder} <ArrowRight size={17} /></SubmitButton>
                  </form>
                ) : (
                  <>
                    <Link href={`/pedidos/novo?orcamento=${id}`} className="btn-primary w-full">{q_.orderWithItems}</Link>
                    <EmpresaHint>{q_.oneClickUpsell}</EmpresaHint>
                  </>
                )}
              </>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
