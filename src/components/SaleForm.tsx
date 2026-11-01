"use client";

import { useState } from "react";
import { saveSale } from "@/app/(app)/actions";
import { saleTotals } from "@/lib/calc";
import type { ChannelRow, ProductRow } from "@/lib/data";
import { money, parseNum, pct } from "@/lib/format";
import { SubmitButton } from "./SubmitButton";

const br = (v: number) => (v ? String(Math.round(v * 100) / 100).replace(".", ",") : "");

export function SaleForm({ products, channels, today }: { products: ProductRow[]; channels: ChannelRow[]; today: string }) {
  const [productId, setProductId] = useState("");
  const [channelId, setChannelId] = useState(channels[0]?.id ?? "");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");
  const [shipping, setShipping] = useState("");
  const [manualCost, setManualCost] = useState("");

  const product = products.find((p) => p.id === productId);
  const channel = channels.find((c) => c.id === channelId);
  const t = saleTotals({
    quantity: parseNum(qty, 1),
    unitPrice: parseNum(price),
    unitCost: product ? product.unit_cost : parseNum(manualCost),
    feePct: channel?.fee_pct ?? 0,
    feeFixed: channel?.fee_fixed ?? 0,
    shippingCost: parseNum(shipping),
  });

  return (
    <form action={saveSale} className="card h-fit space-y-4 p-6">
      <h2 className="text-lg font-bold">Registrar venda</h2>
      <div>
        <label className="label" htmlFor="product_id">Produto</label>
        <select
          id="product_id"
          name="product_id"
          className="input"
          value={productId}
          onChange={(e) => {
            setProductId(e.target.value);
            const p = products.find((x) => x.id === e.target.value);
            if (p?.sale_price) setPrice(br(p.sale_price));
          }}
        >
          <option value="">Venda avulsa (sem produto)</option>
          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>
      {!product && (
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="label" htmlFor="description">Descrição</label>
            <input id="description" name="description" className="input" placeholder="Ex.: Encomenda de chaveiros" required />
          </div>
          <div>
            <label className="label" htmlFor="category">Categoria</label>
            <input id="category" name="category" className="input" placeholder="Opcional" />
          </div>
          <div>
            <label className="label" htmlFor="unit_cost">Custo unitário</label>
            <input id="unit_cost" name="unit_cost" className="input tnum" inputMode="decimal" value={manualCost} onChange={(e) => setManualCost(e.target.value)} placeholder="R$ 0" />
          </div>
        </div>
      )}
      <div>
        <label className="label" htmlFor="channel_id">Canal</label>
        <select id="channel_id" name="channel_id" className="input" value={channelId} onChange={(e) => setChannelId(e.target.value)}>
          {channels.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label" htmlFor="quantity">Quantidade</label>
          <input id="quantity" name="quantity" className="input tnum" inputMode="numeric" value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
        <div>
          <label className="label" htmlFor="unit_price">Preço unitário</label>
          <input id="unit_price" name="unit_price" className="input tnum" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="R$ 0" required />
        </div>
        <div>
          <label className="label" htmlFor="shipping_cost">Frete pago por você</label>
          <input id="shipping_cost" name="shipping_cost" className="input tnum" inputMode="decimal" value={shipping} onChange={(e) => setShipping(e.target.value)} placeholder="R$ 0" />
        </div>
        <div>
          <label className="label" htmlFor="sold_at">Data</label>
          <input id="sold_at" name="sold_at" type="date" className="input" defaultValue={today} />
        </div>
      </div>

      {t.revenue > 0 && (
        <div className={`tnum rounded-xl p-4 text-sm ${t.profit < 0 ? "bg-negative-soft" : "bg-primary-soft"}`}>
          <div className="flex justify-between"><span className="text-muted">Faturamento</span><b>{money(t.revenue)}</b></div>
          <div className="flex justify-between"><span className="text-muted">Taxas</span><span>− {money(t.fees)}</span></div>
          <div className="flex justify-between"><span className="text-muted">Custos + frete</span><span>− {money(t.cost)}</span></div>
          <div className={`mt-2 flex justify-between border-t border-line pt-2 font-bold ${t.profit < 0 ? "text-negative" : "text-primary"}`}>
            <span>Lucro</span><span>{money(t.profit)} ({pct(t.marginPct)})</span>
          </div>
        </div>
      )}

      <SubmitButton className="btn-primary w-full">Registrar venda</SubmitButton>
    </form>
  );
}
