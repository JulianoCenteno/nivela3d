"use client";

import { Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { useI18n } from "@/i18n/client";
import type { Item } from "@/lib/orders";
import { parseNum } from "@/lib/format";

type P = { id: string; name: string; sale_price: number; unit_cost: number };
type Row = { product_id: string; description: string; qty: string; unit_price: string; unit_cost: number };

const toRow = (i: Item, dv: (v: number) => string): Row => ({
  product_id: i.product_id ?? "",
  description: i.description,
  qty: String(i.qty),
  unit_price: dv(i.unit_price),
  unit_cost: i.unit_cost,
});
const empty = (): Row => ({ product_id: "", description: "", qty: "1", unit_price: "", unit_cost: 0 });

export function ItemsEditor({
  products,
  initial,
  discount: d0 = 0,
  shipping: s0 = 0,
}: {
  products: P[];
  initial?: Item[];
  discount?: number;
  shipping?: number;
}) {
  const { t, fmt } = useI18n();
  const f = t.ops.form;
  const money = fmt.money;
  const [rows, setRows] = useState<Row[]>(initial?.length ? initial.map((i) => toRow(i, fmt.dv)) : [empty()]);
  const [discount, setDiscount] = useState(d0 ? fmt.dv(d0) : "");
  const [shipping, setShipping] = useState(s0 ? fmt.dv(s0) : "");

  const items = useMemo(
    () =>
      rows
        .filter((r) => r.description.trim() || r.product_id)
        .map((r) => ({
          product_id: r.product_id || null,
          description: r.description.trim() || t.gestao.item,
          qty: Math.max(1, Math.round(parseNum(r.qty, 1))),
          unit_price: parseNum(r.unit_price),
          unit_cost: r.unit_cost,
        })),
    [rows, t],
  );
  const subtotal = items.reduce((a, i) => a + i.qty * i.unit_price, 0);
  const cost = items.reduce((a, i) => a + i.qty * i.unit_cost, 0);
  const total = Math.max(0, subtotal - parseNum(discount) + parseNum(shipping));
  const profit = subtotal - parseNum(discount) - cost;

  const update = (idx: number, patch: Partial<Row>) => setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, ...patch } : r)));
  const pick = (idx: number, id: string) => {
    const p = products.find((x) => x.id === id);
    update(idx, p
      ? { product_id: id, description: p.name, unit_price: p.sale_price ? fmt.dv(p.sale_price) : "", unit_cost: p.unit_cost }
      : { product_id: "", unit_cost: 0 });
  };

  return (
    <div className="space-y-4">
      <input type="hidden" name="items" value={JSON.stringify(items)} />
      <div className="space-y-3">
        {rows.map((r, idx) => (
          <div key={idx} className="rounded-xl border border-line bg-surface-2 p-3">
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr]">
              <select className="input" value={r.product_id} onChange={(e) => pick(idx, e.target.value)} aria-label={f.catalogProduct}>
                <option value="">{f.looseItem}</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              <input
                className="input"
                placeholder={f.itemDesc}
                value={r.description}
                onChange={(e) => update(idx, { description: e.target.value })}
                aria-label={f.desc}
              />
            </div>
            <div className="mt-2 flex items-end gap-2">
              <label className="w-20">
                <span className="text-xs font-semibold text-muted">{f.qty}</span>
                <input className="input tnum" inputMode="numeric" value={r.qty} onChange={(e) => update(idx, { qty: e.target.value })} />
              </label>
              <label className="flex-1">
                <span className="text-xs font-semibold text-muted">{f.unitPrice(fmt.symbol)}</span>
                <input className="input tnum" inputMode="decimal" placeholder={fmt.zero} value={r.unit_price} onChange={(e) => update(idx, { unit_price: e.target.value })} />
              </label>
              <p className="tnum hidden w-28 pb-3 text-right font-bold sm:block">
                {money(Math.max(1, Math.round(parseNum(r.qty, 1))) * parseNum(r.unit_price))}
              </p>
              <button
                type="button"
                onClick={() => setRows((rs) => (rs.length > 1 ? rs.filter((_, i) => i !== idx) : [empty()]))}
                className="btn-danger mb-0.5 px-3 py-2.5"
                aria-label={f.removeItem}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setRows((rs) => [...rs, empty()])} className="btn-ghost w-full">
        <Plus size={18} /> {f.addItem}
      </button>

      <div className="grid grid-cols-2 gap-3">
        <label>
          <span className="label">{f.discount(fmt.symbol)}</span>
          <input name="discount" className="input tnum" inputMode="decimal" placeholder={fmt.zero} value={discount} onChange={(e) => setDiscount(e.target.value)} />
        </label>
        <label>
          <span className="label">{f.shippingCharged(fmt.symbol)}</span>
          <input name="shipping" className="input tnum" inputMode="decimal" placeholder={fmt.zero} value={shipping} onChange={(e) => setShipping(e.target.value)} />
        </label>
      </div>

      <div className="rounded-xl bg-primary p-4 text-on-primary">
        <div className="flex items-baseline justify-between">
          <span className="font-semibold opacity-85">{f.totalCustomer}</span>
          <span className="tnum text-2xl font-extrabold">{money(total)}</span>
        </div>
        {cost > 0 && (
          <p className="mt-1 text-sm opacity-85">
            {f.costLeft} {money(cost)} · {f.leftBeforeFees}{" "}
            <b className="tnum">{money(profit)}</b>
          </p>
        )}
      </div>
    </div>
  );
}
