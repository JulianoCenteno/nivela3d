import { Paperclip } from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/DeleteButton";
import { SubmitButton } from "@/components/SubmitButton";
import { Field, Flash, PageHeader } from "@/components/ui";
import { getSupplies } from "@/lib/data";
import { supplySuggestions, supplyUnits } from "@/lib/material-catalog";
import { getI18n, getT } from "@/i18n/server";
import { deleteSupply, saveSupply } from "../actions";

export async function generateMetadata() {
  return { title: (await getT()).catalog.supplies.title };
}

export default async function SuppliesPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string; editar?: string; nome?: string; unidade?: string }>;
}) {
  const sp = await searchParams;
  const supplies = await getSupplies();
  const editing = supplies.find((s) => s.id === sp.editar);
  const { t: tt, fmt, locale } = await getI18n();
  const c = tt.catalog;
  const s_ = c.supplies;
  const { money, dv } = fmt;
  const SUPPLY_SUGGESTIONS = supplySuggestions(locale);
  const SUPPLY_UNITS = supplyUnits(locale);
  const have = new Set(supplies.map((s) => s.name.toLowerCase()));
  const suggestions = SUPPLY_SUGGESTIONS.filter((s) => !have.has(s.name.toLowerCase()));

  return (
    <>
      <PageHeader
        title={s_.title}
        description={s_.desc}
      />
      <Flash ok={sp.ok} erro={sp.erro} />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="space-y-3">
          {supplies.length === 0 && (
            <div className="card flex items-center gap-4 p-6 text-muted">
              <Paperclip className="shrink-0 text-sage" /> {s_.empty}
            </div>
          )}
          {supplies.map((s) => (
            <div key={s.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
              <div className="w-fit rounded-xl bg-sand-soft p-3 text-ink-2">
                <Paperclip size={22} />
              </div>
              <div className="flex-1">
                <p className="font-bold">{s.name}</p>
                <p className="tnum mt-0.5 text-sm text-muted">{s_.per(money(s.unit_price), s.unit)}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/insumos?editar=${s.id}`} className="btn-ghost px-3 py-2 text-sm">{tt.common.actions.edit}</Link>
                <DeleteButton id={s.id} action={deleteSupply} confirmText={c.removeName(s.name)} />
              </div>
            </div>
          ))}
        </section>

        <div className="space-y-4">
          <form action={saveSupply} className="card h-fit space-y-4 p-6" key={editing?.id ?? sp.nome ?? "novo"}>
            <h2 className="text-lg font-bold">{editing ? s_.edit : s_.new}</h2>
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <Field label={c.name} name="name" placeholder={s_.namePh} defaultValue={editing?.name ?? sp.nome ?? ""} required />
            <div className="grid grid-cols-[1fr_110px] gap-3">
              <Field
                label={s_.unitPrice}
                name="unit_price"
                prefix={fmt.symbol}
                inputMode="decimal"
                defaultValue={dv(editing?.unit_price)}
                required
              />
              <div>
                <label className="label" htmlFor="unit">{s_.unit}</label>
                <select id="unit" name="unit" className="input" defaultValue={editing?.unit ?? sp.unidade ?? SUPPLY_UNITS[0]}>
                  {SUPPLY_UNITS.map((u) => <option key={u}>{u}</option>)}
                </select>
              </div>
            </div>
            <p className="hint -mt-2">{s_.hint}</p>
            <div className="flex gap-2 pt-1">
              <SubmitButton className="btn-primary flex-1">{editing ? c.saveChanges : c.register}</SubmitButton>
              {editing && <Link href="/insumos" className="btn-ghost">{tt.common.actions.cancel}</Link>}
            </div>
          </form>

          {!editing && suggestions.length > 0 && (
            <div className="card p-6">
              <p className="text-sm font-semibold text-muted">{s_.quick}</p>
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
