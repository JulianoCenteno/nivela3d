import Link from "next/link";
import { saveProduct } from "@/app/(app)/actions";
import type { ChannelRow, MaterialRow, PrinterRow, ProductRow, Settings, SupplyRow } from "@/lib/data";
import { CostCalculator } from "./CostCalculator";
import { SubmitButton } from "./SubmitButton";
import { getT } from "@/i18n/server";

export async function ProductForm({
  product,
  printers,
  materials,
  channels,
  settings,
  supplies,
  categories,
}: {
  product?: ProductRow;
  printers: PrinterRow[];
  materials: MaterialRow[];
  channels: ChannelRow[];
  settings: Settings;
  supplies: SupplyRow[];
  categories: string[];
}) {
  const t = await getT();
  const f = t.products.form;
  return (
    <form action={saveProduct} className="space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}
      <div className="card grid gap-4 p-6 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">{f.name}</label>
          <input id="name" name="name" className="input" defaultValue={product?.name} placeholder={f.namePh} required />
        </div>
        <div>
          <label className="label" htmlFor="category">{f.category}</label>
          <input id="category" name="category" className="input" list="cats" defaultValue={product?.category ?? ""} placeholder={f.categoryPh} />
          <datalist id="cats">
            {categories.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
      </div>

      <CostCalculator
        printers={printers}
        materials={materials}
        channels={channels}
        settings={settings}
        supplies={supplies}
        initial={product}
        withPriceField
      />

      <div className="card p-6">
        <label className="label" htmlFor="notes">{f.notes}</label>
        <textarea id="notes" name="notes" rows={3} className="input" defaultValue={product?.notes ?? ""} placeholder={f.notesPh} />
      </div>

      <div className="flex gap-3">
        <SubmitButton>{product ? t.catalog.saveChanges : f.create}</SubmitButton>
        <Link href="/produtos" className="btn-ghost">{t.common.actions.cancel}</Link>
      </div>
    </form>
  );
}
