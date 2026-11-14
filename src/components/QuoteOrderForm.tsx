import Link from "next/link";
import { ItemsEditor } from "@/components/ItemsEditor";
import { SubmitButton } from "@/components/SubmitButton";
import { getI18n } from "@/i18n/server";
import type { ChannelRow, ProductRow } from "@/lib/data";
import type { OrderRow, QuoteRow } from "@/lib/orders";

export async function QuoteOrderForm({
  mode,
  action,
  products,
  channels,
  people = [],
  quote,
  order,
  defaultValidUntil,
}: {
  mode: "quote" | "order";
  action: (fd: FormData) => Promise<void>;
  products: ProductRow[];
  channels: ChannelRow[];
  people?: { id: string; name: string }[];
  quote?: QuoteRow | null;
  order?: OrderRow | null;
  defaultValidUntil?: string;
}) {
  const { t, fmt } = await getI18n();
  const f = t.ops.form;
  const cur = quote ?? order;
  const cancel = cur?.id ? `/${mode === "quote" ? "orcamentos" : "pedidos"}/${cur.id}` : `/${mode === "quote" ? "orcamentos" : "pedidos"}`;
  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {cur?.id && <input type="hidden" name="id" value={cur.id} />}
      <section className="card space-y-4 p-5 sm:p-6">
        <h2 className="text-lg font-bold">{f.items}</h2>
        <ItemsEditor
          products={products.map((p) => ({ id: p.id, name: p.name, sale_price: p.sale_price, unit_cost: p.unit_cost }))}
          initial={cur?.items}
          discount={cur?.discount}
          shipping={cur?.shipping}
        />
      </section>

      <section className="card h-fit space-y-4 p-5 sm:p-6">
        <h2 className="text-lg font-bold">{f.customer}</h2>
        <div>
          <label className="label" htmlFor="customer_name">{f.customerName}</label>
          <input id="customer_name" name="customer_name" className="input" defaultValue={cur?.customer_name ?? ""} required />
        </div>
        <div>
          <label className="label" htmlFor="customer_phone">{f.whatsapp}</label>
          <input id="customer_phone" name="customer_phone" className="input" inputMode="tel" placeholder={f.phonePh} defaultValue={cur?.customer_phone ?? ""} />
        </div>
        <div>
          <label className="label" htmlFor="channel_id">{f.channel}</label>
          <select id="channel_id" name="channel_id" className="input" defaultValue={cur?.channel_id ?? channels[0]?.id ?? ""}>
            <option value="">{f.noChannel}</option>
            {channels.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <p className="hint">{f.channelHint}</p>
        </div>

        {mode === "quote" ? (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="valid_until">{f.validUntil}</label>
              <input id="valid_until" name="valid_until" type="date" className="input" defaultValue={quote?.valid_until ?? defaultValidUntil} />
            </div>
            <div>
              <label className="label" htmlFor="delivery_days">{f.leadDays}</label>
              <input id="delivery_days" name="delivery_days" className="input tnum" inputMode="numeric" placeholder={f.leadDaysPh} defaultValue={quote?.delivery_days ?? ""} />
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="due_date">{f.dueDate}</label>
                <input id="due_date" name="due_date" type="date" className="input" defaultValue={order?.due_date ?? ""} />
              </div>
              <div>
                <label className="label" htmlFor="shipping_cost">{f.shippingPaid}</label>
                <input id="shipping_cost" name="shipping_cost" className="input tnum" inputMode="decimal" placeholder={fmt.zero} defaultValue={fmt.dv(order?.shipping_cost)} />
              </div>
            </div>
            {people.length > 1 && (
              <div>
                <label className="label" htmlFor="assigned_to">{f.responsible}</label>
                <select id="assigned_to" name="assigned_to" className="input" defaultValue={order?.assigned_to ?? ""}>
                  <option value="">{f.nobody}</option>
                  {people.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}

        <div>
          <label className="label" htmlFor="notes">{f.notes}</label>
          <textarea id="notes" name="notes" rows={3} className="input" placeholder={f.notesPh} defaultValue={cur?.notes ?? ""} />
        </div>
        <div className="flex gap-2 pt-1">
          <SubmitButton className="btn-primary flex-1">{cur?.id ? t.common.actions.save : mode === "quote" ? f.createQuote : f.createOrder}</SubmitButton>
          <Link href={cancel} className="btn-ghost">{t.common.actions.cancel}</Link>
        </div>
      </section>
    </form>
  );
}
