import { Check, MessageCircle, Package, Pencil, Receipt, Zap } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/DeleteButton";
import { Badge, EmpresaHint } from "@/components/gestao";
import { SubmitButton } from "@/components/SubmitButton";
import { Flash, PageHeader } from "@/components/ui";
import { getChannels, getContext, getMaterials, getProducts, getSettings, getSupplies } from "@/lib/data";
import { getOrder, getPeople } from "@/lib/gestao-data";
import { deadlineInfo, deadlineText, itemsTotals, ORDER_FLOW, ORDER_TONE, stockNeeds, waLink } from "@/lib/orders";
import { todayISO } from "@/lib/period";
import { hasFeature } from "@/lib/plans";
import { getI18n, getT } from "@/i18n/server";
import { deductOrderStock, deleteOrder, registerOrderSale, setOrderStatus } from "../../gestao-actions";

export async function generateMetadata() {
  return { title: (await getT()).ops.orders.title };
}

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string; erro?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { plan } = await getContext();
  const [order, products, materials, supplies, channels, settings, people] = await Promise.all([
    getOrder(id),
    getProducts(),
    getMaterials(),
    getSupplies(),
    getChannels(),
    getSettings(),
    hasFeature(plan, "equipe") ? getPeople() : Promise.resolve([]),
  ]);
  if (!order) notFound();
  const { t: tt, fmt } = await getI18n();
  const o_ = tt.ops.orders;
  const { money, number } = fmt;
  const auto = hasFeature(plan, "automacoes");
  const t = itemsTotals(order.items, order.discount, order.shipping);
  const channel = channels.find((c) => c.id === order.channel_id);
  const fees = channel ? t.total * (channel.fee_pct / 100) + channel.fee_fixed : 0;
  const profit = t.total - fees - t.cost - order.shipping_cost;
  const st = { tone: ORDER_TONE[order.status], label: tt.gestao.orderStatus[order.status] };
  const d = deadlineInfo(order, todayISO());
  const need = stockNeeds(order.items, products);
  const stepIdx = ORDER_FLOW.indexOf(order.status);
  const business = settings.business_name || o_.ourShop;
  const readyMsg = o_.readyMsg(order.customer_name.split(" ")[0], order.number, business);
  const responsible = people.find((p) => p.id === order.assigned_to)?.name;

  return (
    <>
      <PageHeader
        title={o_.titleN(order.number)}
        description={`${order.customer_name}${order.due_date ? ` · ${o_.deliverBy(fmt.short(order.due_date))}` : ""}${responsible ? ` · ${responsible}` : ""}`}
        action={
          <div className="flex gap-2">
            <Link href={`/pedidos/${id}/editar`} className="btn-ghost"><Pencil size={17} /> {tt.common.actions.edit}</Link>
            <DeleteButton id={id} action={deleteOrder} confirmText={o_.removeConfirm} />
          </div>
        }
      />
      <Flash ok={sp.ok} erro={sp.erro} />

      {/* Etapas */}
      <section className="card mb-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge tone={st.tone}>{st.label}</Badge>
            {d && <span className={`text-sm font-bold ${d.level === "atrasado" ? "text-negative" : "text-ink-2"}`}>{deadlineText(d, tt.gestao.deadline)}</span>}
          </div>
          {order.status !== "cancelado" && order.status !== "entregue" && (
            <form action={setOrderStatus}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="status" value="cancelado" />
              <button className="text-sm font-semibold text-muted hover:text-negative">{o_.cancel}</button>
            </form>
          )}
        </div>
        <ol className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ORDER_FLOW.map((s, i) => {
            const done = order.status !== "cancelado" && i <= stepIdx;
            const isNext = order.status !== "cancelado" && i === stepIdx + 1;
            return (
              <li key={s}>
                <form action={setOrderStatus}>
                  <input type="hidden" name="id" value={id} />
                  <input type="hidden" name="status" value={s} />
                  <button
                    disabled={i === stepIdx}
                    className={`flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-3 text-sm font-bold transition ${
                      done ? "bg-primary text-on-primary" : isNext ? "border-2 border-primary text-primary hover:bg-primary-soft" : "bg-surface-2 text-muted hover:bg-line"
                    }`}
                  >
                    {done && <Check size={16} />} {tt.gestao.orderStatus[s]}
                  </button>
                </form>
              </li>
            );
          })}
        </ol>
        {auto ? (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
            <Zap size={15} className="text-sage" /> {o_.autoNote}
          </p>
        ) : (
          <div className="mt-3"><EmpresaHint>{o_.autoUpsell}</EmpresaHint></div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="card p-5 sm:p-6">
          <h2 className="mb-2 text-lg font-bold">{tt.ops.form.items}</h2>
          <ul className="divide-y divide-line">
            {order.items.map((i, k) => (
              <li key={k} className="flex justify-between gap-4 py-3">
                <span>
                  <b>{i.qty}×</b> {i.description}
                  <span className="block text-sm text-muted">{money(i.unit_price)} {tt.ops.quotes.each}</span>
                </span>
                <span className="tnum font-semibold">{money(i.qty * i.unit_price)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-line pt-4 text-[15px]">
            <div className="flex justify-between"><dt className="text-muted">{o_.customerTotal}</dt><dd className="tnum font-bold">{money(t.total)}</dd></div>
            {fees > 0 && <div className="flex justify-between"><dt className="text-muted">{o_.fee(channel?.name ?? "")}</dt><dd className="tnum">-{money(fees)}</dd></div>}
            {t.cost > 0 && <div className="flex justify-between"><dt className="text-muted">{o_.partsCost}</dt><dd className="tnum">-{money(t.cost)}</dd></div>}
            {order.shipping_cost > 0 && <div className="flex justify-between"><dt className="text-muted">{o_.shippingPaid}</dt><dd className="tnum">-{money(order.shipping_cost)}</dd></div>}
            <div className="flex justify-between pt-1 text-lg font-extrabold">
              <dt>{o_.profit}</dt>
              <dd className={`tnum ${profit < 0 ? "text-negative" : "text-positive"}`}>{money(profit)}</dd>
            </div>
          </dl>
          {order.notes && <p className="mt-4 rounded-xl bg-surface-2 p-3 text-[15px]">{order.notes}</p>}
        </section>

        <aside className="space-y-4">
          <div className="card space-y-3 p-5">
            <h2 className="font-bold">{tt.ops.form.customer}</h2>
            <p className="text-[15px]">{order.customer_name}<span className="block text-muted">{order.customer_phone || o_.noWhatsapp}</span></p>
            {order.customer_phone && (
              <a href={waLink(order.customer_phone, readyMsg)} target="_blank" rel="noopener" className="btn-ghost w-full">
                <MessageCircle size={17} /> {o_.notifyReady}
              </a>
            )}
          </div>

          <div className="card space-y-3 p-5">
            <h2 className="flex items-center gap-2 font-bold"><Package size={18} /> {o_.stock}</h2>
            {need.materials.size + need.supplies.size === 0 ? (
              <p className="text-sm text-muted">{o_.notCatalog}</p>
            ) : (
              <ul className="space-y-1 text-[15px]">
                {[...need.materials].map(([mid, g]) => (
                  <li key={mid} className="flex justify-between"><span>{materials.find((m) => m.id === mid)?.name ?? o_.filament}</span><span className="tnum">{number(g)} g</span></li>
                ))}
                {[...need.supplies].map(([sid, q]) => (
                  <li key={sid} className="flex justify-between"><span>{supplies.find((s) => s.id === sid)?.name ?? o_.supply}</span><span className="tnum">{number(q)} {o_.unit}</span></li>
                ))}
              </ul>
            )}
            {order.stock_deducted ? (
              <p className="flex items-center gap-1.5 text-sm font-semibold text-positive"><Check size={16} /> {o_.deducted}</p>
            ) : (
              need.materials.size + need.supplies.size > 0 &&
              !auto && (
                <form action={deductOrderStock}>
                  <input type="hidden" name="id" value={id} />
                  <SubmitButton className="btn-ghost w-full" pendingText={o_.deducting}>{o_.deduct}</SubmitButton>
                </form>
              )
            )}
          </div>

          <div className="card space-y-3 p-5">
            <h2 className="flex items-center gap-2 font-bold"><Receipt size={18} /> {o_.sale}</h2>
            {order.sale_registered ? (
              <p className="flex items-center gap-1.5 text-sm font-semibold text-positive"><Check size={16} /> {o_.saleDone}</p>
            ) : auto ? (
              <p className="text-sm text-muted">{o_.saleAuto}</p>
            ) : (
              <form action={registerOrderSale}>
                <input type="hidden" name="id" value={id} />
                <SubmitButton className="btn-primary w-full" pendingText={o_.registering}>{o_.register}</SubmitButton>
              </form>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
