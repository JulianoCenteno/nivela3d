import { Spool } from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/DeleteButton";
import { SubmitButton } from "@/components/SubmitButton";
import { dv, Field, Flash, PageHeader } from "@/components/ui";
import { getMaterials } from "@/lib/data";
import { money } from "@/lib/format";
import { MATERIAL_GROUPS } from "@/lib/material-catalog";
import { deleteMaterial, saveMaterial } from "../actions";

export const metadata = { title: "Materiais" };


export default async function MaterialsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string; editar?: string }>;
}) {
  const sp = await searchParams;
  const materials = await getMaterials();
  const editing = materials.find((m) => m.id === sp.editar);

  return (
    <>
      <PageHeader title="Materiais" description="Filamentos e resinas que você usa, com o preço que você paga por quilo. Argolas, ímãs e embalagens ficam em Insumos." />
      <Flash ok={sp.ok} erro={sp.erro} />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="space-y-3">
          {materials.length === 0 && (
            <div className="card flex items-center gap-4 p-6 text-muted">
              <Spool className="shrink-0 text-sage" /> Cadastre seu primeiro filamento ao lado.
            </div>
          )}
          {materials.map((m) => (
            <div key={m.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <div className="rounded-xl bg-sand-soft p-3 text-ink-2">
                <Spool size={22} />
              </div>
              <div className="flex-1">
                <p className="font-bold">
                  {m.name} <span className="ml-1 rounded-md bg-surface-2 px-1.5 py-0.5 text-xs font-semibold text-muted">{m.type}</span>
                </p>
                <p className="tnum mt-0.5 text-sm text-muted">
                  {money(m.price_per_kg)}/kg · {money(m.price_per_kg / 1000)}/g{m.color ? ` · ${m.color}` : ""}
                </p>
              </div>
              <div className="flex gap-2">
                <Link href={`/materiais?editar=${m.id}`} className="btn-ghost px-3 py-2 text-sm">Editar</Link>
                <DeleteButton id={m.id} action={deleteMaterial} confirmText={`Remover ${m.name}?`} />
              </div>
            </div>
          ))}
        </section>

        <form action={saveMaterial} className="card h-fit space-y-4 p-6" key={editing?.id ?? "novo"}>
          <h2 className="text-lg font-bold">{editing ? "Editar material" : "Novo material"}</h2>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <Field label="Nome" name="name" placeholder="Ex.: PLA Preto Voolt" defaultValue={editing?.name} required />
          <div>
            <label className="label" htmlFor="type">Tipo</label>
            <select id="type" name="type" className="input" defaultValue={editing?.type ?? "PLA"}>
              {MATERIAL_GROUPS.map((g) => (
                <optgroup key={g.group} label={g.group}>
                  {g.types.map((t) => <option key={t}>{t}</option>)}
                </optgroup>
              ))}
              {editing && !MATERIAL_GROUPS.some((g) => g.types.includes(editing.type)) && <option>{editing.type}</option>}
            </select>
          </div>
          <Field label="Cor" name="color" placeholder="Opcional" defaultValue={editing?.color ?? ""} />
          <Field
            label="Preço por kg"
            name="price_per_kg"
            prefix="R$"
            inputMode="decimal"
            defaultValue={dv(editing?.price_per_kg)}
            hint="Se pagou R$ 89 num rolo de 1 kg com frete de R$ 15, informe 104. Resina: preço por kg (≈ por litro)."
            required
          />
          <div className="flex gap-2 pt-1">
            <SubmitButton className="btn-primary flex-1">{editing ? "Salvar alterações" : "Cadastrar"}</SubmitButton>
            {editing && <Link href="/materiais" className="btn-ghost">Cancelar</Link>}
          </div>
        </form>
      </div>
    </>
  );
}
