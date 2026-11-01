import Link from "next/link";
import { saveProduct } from "@/app/(app)/actions";
import type { ChannelRow, MaterialRow, PrinterRow, ProductRow, Settings, SupplyRow } from "@/lib/data";
import { CostCalculator } from "./CostCalculator";
import { SubmitButton } from "./SubmitButton";

export function ProductForm({
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
  return (
    <form action={saveProduct} className="space-y-6">
      {product && <input type="hidden" name="id" value={product.id} />}
      <div className="card grid gap-4 p-6 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Nome do produto</label>
          <input id="name" name="name" className="input" defaultValue={product?.name} placeholder="Ex.: Vaso geométrico P" required />
        </div>
        <div>
          <label className="label" htmlFor="category">Categoria</label>
          <input id="category" name="category" className="input" list="cats" defaultValue={product?.category ?? ""} placeholder="Ex.: Decoração" />
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
        <label className="label" htmlFor="notes">Observações</label>
        <textarea id="notes" name="notes" rows={3} className="input" defaultValue={product?.notes ?? ""} placeholder="Configurações de fatiamento, cores, fornecedor do arquivo…" />
      </div>

      <div className="flex gap-3">
        <SubmitButton>{product ? "Salvar alterações" : "Cadastrar produto"}</SubmitButton>
        <Link href="/produtos" className="btn-ghost">Cancelar</Link>
      </div>
    </form>
  );
}
