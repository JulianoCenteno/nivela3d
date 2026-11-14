import { Spool } from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/DeleteButton";
import { SubmitButton } from "@/components/SubmitButton";
import { Field, Flash, PageHeader } from "@/components/ui";
import { getMaterials } from "@/lib/data";
import { materialGroups } from "@/lib/material-catalog";
import { getI18n, getT } from "@/i18n/server";
import { deleteMaterial, saveMaterial } from "../actions";

export async function generateMetadata() {
  return { title: (await getT()).catalog.materials.title };
}


export default async function MaterialsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string; editar?: string }>;
}) {
  const sp = await searchParams;
  const materials = await getMaterials();
  const editing = materials.find((m) => m.id === sp.editar);
  const { t: tt, fmt, locale } = await getI18n();
  const c = tt.catalog;
  const m_ = c.materials;
  const { money, dv } = fmt;
  const MATERIAL_GROUPS = materialGroups(locale);

  return (
    <>
      <PageHeader title={m_.title} description={m_.desc} />
      <Flash ok={sp.ok} erro={sp.erro} />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="space-y-3">
          {materials.length === 0 && (
            <div className="card flex items-center gap-4 p-6 text-muted">
              <Spool className="shrink-0 text-sage" /> {m_.empty}
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
                <Link href={`/materiais?editar=${m.id}`} className="btn-ghost px-3 py-2 text-sm">{tt.common.actions.edit}</Link>
                <DeleteButton id={m.id} action={deleteMaterial} confirmText={c.removeName(m.name)} />
              </div>
            </div>
          ))}
        </section>

        <form action={saveMaterial} className="card h-fit space-y-4 p-6" key={editing?.id ?? "novo"}>
          <h2 className="text-lg font-bold">{editing ? m_.edit : m_.new}</h2>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          <Field label={c.name} name="name" placeholder={m_.namePh} defaultValue={editing?.name} required />
          <div>
            <label className="label" htmlFor="type">{m_.type}</label>
            <select id="type" name="type" className="input" defaultValue={editing?.type ?? "PLA"}>
              {MATERIAL_GROUPS.map((g) => (
                <optgroup key={g.group} label={g.group}>
                  {g.types.map((t) => <option key={t}>{t}</option>)}
                </optgroup>
              ))}
              {editing && !MATERIAL_GROUPS.some((g) => g.types.includes(editing.type)) && <option>{editing.type}</option>}
            </select>
          </div>
          <Field label={m_.color} name="color" placeholder={m_.optional} defaultValue={editing?.color ?? ""} />
          <Field
            label={m_.pricePerKg}
            name="price_per_kg"
            prefix={fmt.symbol}
            inputMode="decimal"
            defaultValue={dv(editing?.price_per_kg)}
            hint={m_.priceHint}
            required
          />
          <div className="flex gap-2 pt-1">
            <SubmitButton className="btn-primary flex-1">{editing ? c.saveChanges : c.register}</SubmitButton>
            {editing && <Link href="/materiais" className="btn-ghost">{tt.common.actions.cancel}</Link>}
          </div>
        </form>
      </div>
    </>
  );
}
