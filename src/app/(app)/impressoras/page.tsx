import { Printer } from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/DeleteButton";
import { PrinterModelPicker } from "@/components/PrinterModelPicker";
import { SubmitButton } from "@/components/SubmitButton";
import { Field, Flash, PageHeader } from "@/components/ui";
import { getContext, getPrinters } from "@/lib/data";
import { planInfo, UNLIMITED } from "@/lib/plans";
import { deletePrinter, savePrinter } from "../actions";
import { getI18n, getT } from "@/i18n/server";

export async function generateMetadata() {
  return { title: (await getT()).catalog.printers.title };
}

export default async function PrintersPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string; editar?: string }>;
}) {
  const sp = await searchParams;
  const [{ plan }, printers] = await Promise.all([getContext(), getPrinters()]);
  const editing = printers.find((p) => p.id === sp.editar);
  const { t: tt, fmt } = await getI18n();
  const c = tt.catalog;
  const p_ = c.printers;
  const { money, number, dv } = fmt;
  const limit = planInfo(plan)?.printers ?? 0;

  return (
    <>
      <PageHeader
        title={p_.title}
        description={p_.desc}
      />
      <Flash ok={sp.ok} erro={sp.erro} />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="space-y-3">
          {printers.length === 0 && (
            <div className="card flex items-center gap-4 p-6 text-muted">
              <Printer className="shrink-0 text-sage" /> {p_.empty}
            </div>
          )}
          {printers.map((p) => {
            const wearPerHour = p.lifetime_hours > 0 ? p.purchase_price / p.lifetime_hours : 0;
            return (
              <div key={p.id} className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
                <div className="rounded-xl bg-primary-soft p-3 text-primary">
                  <Printer size={22} />
                </div>
                <div className="flex-1">
                  <p className="font-bold">{p.name}</p>
                  <p className="tnum mt-0.5 text-sm text-muted">
                    {p_.line(number(p.power_watts), money(wearPerHour), money(p.maintenance_per_hour))}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/impressoras?editar=${p.id}`} className="btn-ghost px-3 py-2 text-sm">
                    {tt.common.actions.edit}
                  </Link>
                  <DeleteButton id={p.id} action={deletePrinter} confirmText={c.removeName(p.name)} />
                </div>
              </div>
            );
          })}
          <p className="text-sm text-muted">
            {limit >= UNLIMITED ? p_.unlimited(printers.length) : p_.ofLimit(printers.length, limit)}
          </p>
        </section>

        <form action={savePrinter} className="card h-fit space-y-4 p-6" key={editing?.id ?? "nova"}>
          <h2 className="text-lg font-bold">{editing ? p_.edit : p_.new}</h2>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          {!editing && <PrinterModelPicker />}
          <Field label={c.name} name="name" placeholder={p_.namePh} defaultValue={editing?.name} required />
          <Field
            label={p_.power}
            name="power_watts"
            suffix="W"
            inputMode="decimal"
            defaultValue={dv(editing?.power_watts ?? 150)}
            hint={p_.powerHint}
          />
          <Field
            label={p_.paid}
            name="purchase_price"
            prefix={fmt.symbol}
            inputMode="decimal"
            defaultValue={dv(editing?.purchase_price ?? 0)}
          />
          <Field
            label={p_.life}
            name="lifetime_hours"
            suffix={p_.hours}
            inputMode="numeric"
            defaultValue={dv(editing?.lifetime_hours ?? 5000)}
            hint={p_.lifeHint}
          />
          <Field
            label={p_.maint}
            name="maintenance_per_hour"
            prefix={fmt.symbol}
            inputMode="decimal"
            defaultValue={dv(editing?.maintenance_per_hour ?? 0.15)}
            hint={p_.maintHint}
          />
          <div className="flex gap-2 pt-1">
            <SubmitButton className="btn-primary flex-1">{editing ? c.saveChanges : c.register}</SubmitButton>
            {editing && (
              <Link href="/impressoras" className="btn-ghost">
                {tt.common.actions.cancel}
              </Link>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
