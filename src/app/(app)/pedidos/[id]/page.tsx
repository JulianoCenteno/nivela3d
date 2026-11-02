import { Check, MessageCircle, Package, Pencil, Receipt, Zap } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/DeleteButton";
import { Badge, EmpresaHint } from "@/components/gestao";
import { SubmitButton } from "@/components/SubmitButton";
import { Flash, PageHeader } from "@/components/ui";
import { getChannels, getContext, getMaterials, getProducts, getSettings, getSupplies } from "@/lib/data";
import { money, number } from "@/lib/format";
import { getOrder, getPeople } from "@/lib/gestao-data";
import { deadlineInfo, itemsTotals, ORDER_FLOW, ORDER_STATUS, stockNeeds, waLink } from "@/lib/orders";
import { fmtDate, todayISO } from "@/lib/period";
import { hasFeature } from "@/lib/plans";
import { deductOrderStock, deleteOrder, registerOrderSale, setOrderStatus } from "../../gestao-actions";

export const metadata = { title: "Pedido" };

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
  const auto = hasFeature(plan, "automacoes");
  const t = itemsTotals(order.items, order.discount, order.shipping);
  const channel = channels.find((c) => c.id === order.channel_id);
  const fees = channel ? t.total * (channel.fee_pct / 100) + channel.fee_fixed : 0;
  const profit = t.total - fees - t.cost - order.shipping_cost;
  const st = ORDER_STATUS[order.status];
  const d = deadlineInfo(order, todayISO());
  const need = stockNeeds(order.items, products);
  const stepIdx = ORDER_FLOW.indexOf(order.status);
  const business = settings.business_name || "nossa loja";
  const readyMsg = `Olá, ${order.customer_name.split(" ")[0]}! Seu pedido nº ${order.number} da ${business} está pronto 🎉`;
  const responsible = people.find((p) => p.id === order.assigned_to)?.name;

  return (
    <>
      <PageHeader
        title={`Pedido nº ${order.number}`}
        description={`${order.customer_name}${order.due_date ? ` · entregar até ${fmtDate(order.due_date)}` : ""}${responsible ? ` · ${responsible}` : ""}`}
        action={
          <div className="flex gap-2">
            <Link href={`/pedidos/${id}/editar`} className="btn-ghost"><Pencil size={17} /> Editar</Link>
            <DeleteButton id={id} action={deleteOrder} confirmText="Remover este pedido?" />
          </div>
        }
      />
      <Flash ok={sp.ok} erro={sp.erro} />

      {/* Etapas */}
      <section className="card mb-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Badge tone={st.tone}>{st.label}</Badge>
            {d && <span className={`text-sm font-bold ${d.level === "atrasado" ? "text-negative" : "text-ink-2"}`}>{d.text}</span>}
          </div>
          {order.status !== "cancelado" && order.status !== "entregue" && (
            <form action={setOrderStatus}>
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="status" value="cancelado" />
              <button className="text-sm font-semibold text-muted hover:text-negative">Cancelar pedido</button>
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
                    {done && <Check size={16} />} {ORDER_STATUS[s].label}
                  </button>
                </form>
              </li>
            );
          })}
        </ol>
        {auto ? (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
            <Zap size={15} className="text-sage" /> Automático: ao entrar em produção o estoque é baixado; ao entregar, a venda vai para o painel.
          </p>
        ) : (
          <div className="mt-3"><EmpresaHint>Baixa de estoque e venda lançadas sozinhas quando o pedido avança:</EmpresaHint></div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="card p-5 sm:p-6">
          <h2 className="mb-2 text-lg font-bold">Itens</h2>
          <ul className="divide-y divide-line">
            {order.items.map((i, k) => (
              <li key={k} className="flex justify-between gap-4 py-3">
                <span>
                  <b>{i.qty}×</b> {i.description}
                  <span className="block text-sm text-muted">{money(i.unit_price)} cada</span>
                </span>
                <span className="tnum font-semibold">{money(i.qty * i.unit_price)}</span>
              </li>
            ))}
          </ul>
          <dl className="mt-3 space-y-1.5 border-t border-line pt-4 text-[15px]">
            <div className="flex justify-between"><dt className="text-muted">Total do cliente</dt><dd className="tnum font-bold">{money(t.total)}</dd></div>
            {fees > 0 && <div className="flex justify-between"><dt className="text-muted">Taxa {channel?.name}</dt><dd className="tnum">-{money(fees)}</dd></div>}
            {t.cost > 0 && <div className="flex justify-between"><dt className="text-muted">Custo das peças</dt><dd className="tnum">-{money(t.cost)}</dd></div>}
            {order.shipping_cost > 0 && <div className="flex justify-between"><dt className="text-muted">Frete pago</dt><dd className="tnum">-{money(order.shipping_cost)}</dd></div>}
            <div className="flex justify-between pt-1 text-lg font-extrabold">
              <dt>Lucro do pedido</dt>
              <dd className={`tnum ${profit < 0 ? "text-negative" : "text-positive"}`}>{money(profit)}</dd>
            </div>
          </dl>
          {order.notes && <p className="mt-4 rounded-xl bg-surface-2 p-3 text-[15px]">{order.notes}</p>}
        </section>

        <aside className="space-y-4">
          <div className="card space-y-3 p-5">
            <h2 className="font-bold">Cliente</h2>
            <p className="text-[15px]">{order.customer_name}<span className="block text-muted">{order.customer_phone || "Sem WhatsApp"}</span></p>
            {order.customer_phone && (
              <a href={waLink(order.customer_phone, readyMsg)} target="_blank" rel="noopener" className="btn-ghost w-full">
                <MessageCircle size={17} /> Avisar que está pronto
              </a>
            )}
          </div>

          <div className="card space-y-3 p-5">
            <h2 className="flex items-center gap-2 font-bold"><Package size={18} /> Estoque</h2>
            {need.materials.size + need.supplies.size === 0 ? (
              <p className="text-sm text-muted">Os itens não são produtos do catálogo, então não há baixa automática.</p>
            ) : (
              <ul className="space-y-1 text-[15px]">
                {[...need.materials].map(([mid, g]) => (
                  <li key={mid} className="flex justify-between"><span>{materials.find((m) => m.id === mid)?.name ?? "Filamento"}</span><span className="tnum">{number(g)} g</span></li>
                ))}
                {[...need.supplies].map(([sid, q]) => (
                  <li key={sid} className="flex justify-between"><span>{supplies.find((s) => s.id === sid)?.name ?? "Insumo"}</span><span className="tnum">{number(q)} un</span></li>
                ))}
              </ul>
            )}
            {order.stock_deducted ? (
              <p className="flex items-center gap-1.5 text-sm font-semibold text-positive"><Check size={16} /> Já baixado do estoque</p>
            ) : (
              need.materials.size + need.supplies.size > 0 &&
              !auto && (
                <form action={deductOrderStock}>
                  <input type="hidden" name="id" value={id} />
                  <SubmitButton className="btn-ghost w-full" pendingText="Baixando…">Dar baixa no estoque</SubmitButton>
                </form>
              )
            )}
          </div>

          <div className="card space-y-3 p-5">
            <h2 className="flex items-center gap-2 font-bold"><Receipt size={18} /> Venda</h2>
            {order.sale_registered ? (
              <p className="flex items-center gap-1.5 text-sm font-semibold text-positive"><Check size={16} /> Venda lançada no painel</p>
            ) : auto ? (
              <p className="text-sm text-muted">A venda é lançada sozinha quando o pedido for marcado como entregue.</p>
            ) : (
              <form action={registerOrderSale}>
                <input type="hidden" name="id" value={id} />
                <SubmitButton className="btn-primary w-full" pendingText="Lançando…">Lançar venda no painel</SubmitButton>
              </form>
            )}
          </div>
        </aside>
      </div>
    </>
  );
}
