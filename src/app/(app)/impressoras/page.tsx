import { Printer } from "lucide-react";
import Link from "next/link";
import { DeleteButton } from "@/components/DeleteButton";
import { PrinterModelPicker } from "@/components/PrinterModelPicker";
import { SubmitButton } from "@/components/SubmitButton";
import { dv, Field, Flash, PageHeader } from "@/components/ui";
import { getContext, getPrinters } from "@/lib/data";
import { money, number } from "@/lib/format";
import { planInfo } from "@/lib/plans";
import { deletePrinter, savePrinter } from "../actions";

export const metadata = { title: "Impressoras" };

export default async function PrintersPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string; editar?: string }>;
}) {
  const sp = await searchParams;
  const [{ plan }, printers] = await Promise.all([getContext(), getPrinters()]);
  const editing = printers.find((p) => p.id === sp.editar);
  const limit = planInfo(plan)?.printers ?? 0;

  return (
    <>
      <PageHeader
        title="Impressoras"
        description="O consumo de energia e o desgaste de cada máquina entram no custo das suas peças."
      />
      <Flash ok={sp.ok} erro={sp.erro} />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <section className="space-y-3">
          {printers.length === 0 && (
            <div className="card flex items-center gap-4 p-6 text-muted">
              <Printer className="shrink-0 text-sage" /> Cadastre sua primeira impressora ao lado.
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
                    {number(p.power_watts)} W · desgaste {money(wearPerHour)}/h · manutenção{" "}
                    {money(p.maintenance_per_hour)}/h
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/impressoras?editar=${p.id}`} className="btn-ghost px-3 py-2 text-sm">
                    Editar
                  </Link>
                  <DeleteButton id={p.id} action={deletePrinter} confirmText={`Remover ${p.name}?`} />
                </div>
              </div>
            );
          })}
          <p className="text-sm text-muted">
            {printers.length} de {limit} impressora{limit === 1 ? "" : "s"} do seu plano.
          </p>
        </section>

        <form action={savePrinter} className="card h-fit space-y-4 p-6" key={editing?.id ?? "nova"}>
          <h2 className="text-lg font-bold">{editing ? "Editar impressora" : "Nova impressora"}</h2>
          {editing && <input type="hidden" name="id" value={editing.id} />}
          {!editing && <PrinterModelPicker />}
          <Field label="Nome" name="name" placeholder="Ex.: Bambu A1 Mini" defaultValue={editing?.name} required />
          <Field
            label="Potência média"
            name="power_watts"
            suffix="W"
            inputMode="decimal"
            defaultValue={dv(editing?.power_watts ?? 150)}
            hint="Consumo médio durante a impressão (não o pico). Em geral entre 80 e 350 W."
          />
          <Field
            label="Valor pago"
            name="purchase_price"
            prefix="R$"
            inputMode="decimal"
            defaultValue={dv(editing?.purchase_price ?? 0)}
          />
          <Field
            label="Vida útil estimada"
            name="lifetime_hours"
            suffix="horas"
            inputMode="numeric"
            defaultValue={dv(editing?.lifetime_hours ?? 5000)}
            hint="Horas de impressão até precisar trocar a máquina."
          />
          <Field
            label="Manutenção por hora"
            name="maintenance_per_hour"
            prefix="R$"
            inputMode="decimal"
            defaultValue={dv(editing?.maintenance_per_hour ?? 0.15)}
            hint="Bicos, correias, PEI, lubrificação… dividido pelas horas de uso."
          />
          <div className="flex gap-2 pt-1">
            <SubmitButton className="btn-primary flex-1">{editing ? "Salvar alterações" : "Cadastrar"}</SubmitButton>
            {editing && (
              <Link href="/impressoras" className="btn-ghost">
                Cancelar
              </Link>
            )}
          </div>
        </form>
      </div>
    </>
  );
}
