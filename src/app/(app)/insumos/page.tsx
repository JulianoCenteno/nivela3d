import { Paperclip } from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/DeleteButton";
import { SubmitButton } from "@/components/SubmitButton";
import { dv, Field, Flash, PageHeader } from "@/components/ui";
import { getSupplies } from "@/lib/data";
import { money } from "@/lib/format";
import { SUPPLY_SUGGESTIONS, SUPPLY_UNITS } from "@/lib/material-catalog";
import { deleteSupply, saveSupply } from "../actions";

export const metadata = { title: "Insumos" };

export default async function SuppliesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string; editar?: string; nome?: string; unidade?: string }>;
}) {
  const sp = await searchParams;
  const supplies = await getSupplies();
  const editing = supplies.find((s) => s.id === sp.editar);
  const have = new Set(supplies.map((s) => s.name.toLowerCase()));
  const suggestions = SUPPLY_SUGGESTIONS.filter((s) => !have.has(s.name.toLowerCase()));

  return (
    <>
      <PageHeader
        title="Insumos"
        description="Tudo o que vai junto com a peça impressa: argolas, ímãs, parafusos, embalagens… Depois é só escolher no produto."
      />
      <Flash ok={sp.ok} erro={sp.erro} />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="space-y-3">
          {supplies.length === 0 && (
            <div className="card flex items-center gap-4 p-6 text-muted">
              <Paperclip className="shrink-0 text-sage" /> Nenhum insumo ainda. Use as sugestões ao lado.
            </div>
          )}
          {supplies.map((s) => (
            <div key={s.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <div className="w-fit rounded-xl bg-sand-soft p-3 text-ink-2">
                <Paperclip size={22} />
              </div>
              <div className="flex-1">
                <p className="font-bold">{s.name}</p>
                <p className="tnum mt-0.5 text-sm text-muted">{money(s.unit_price)} por {s.unit}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/insumos?editar=${s.id}`} className="btn-ghost px-3 py-2 text-sm">Editar</Link>
                <DeleteButton id={s.id} action={deleteSupply} confirmText={`Remover ${s.name}?`} />
              </div>
            </div>
          ))}
        </section>

        <div className="space-y-4">
          <form action={saveSupply} className="card h-fit space-y-4 p-6" key={editing?.id ?? sp.nome ?? "novo"}>
            <h2 className="text-lg font-bold">{editing ? "Editar insumo" : "Novo insumo"}</h2>
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <Field label="Nome" name="name" placeholder="Ex.: Argola de chaveiro" defaultValue={editing?.name ?? sp.nome ?? ""} required />
            <div className="grid grid-cols-[1fr_110px] gap-3">
              <Field
                label="Preço por unidade"
                name="unit_price"
                prefix="R$"
                inputMode="decimal"
                defaultValue={dv(editing?.unit_price)}
                required
              />
              <div>
                <label className="label" htmlFor="unit">Unidade</label>
                <select id="unit" name="unit" className="input" defaultValue={editing?.unit ?? sp.unidade ?? "un"}>
                  {SUPPLY_UNITS.map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <p className="hint -mt-2">Comprou 100 argolas por R$ 35? Informe 0,35.</p>
            <div className="flex gap-2 pt-1">
              <SubmitButton className="btn-primary flex-1">{editing ? "Salvar alterações" : "Cadastrar"}</SubmitButton>
              {editing && <Link href="/insumos" className="btn-ghost">Cancelar</Link>}
            </div>
          </form>

          {!editing && suggestions.length > 0 && (
            <div className="card p-6">
              <p className="text-sm font-semibold text-muted">Sugestões rápidas</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <Link
                    key={s.name}
                    href={`/insumos?nome=${encodeURIComponent(s.name)}&unidade=${s.unit}`}
                    className="rounded-full border border-line px-3 py-1.5 text-sm font-medium text-ink-2 transition hover:border-primary hover:text-primary"
                  >
                    + {s.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
