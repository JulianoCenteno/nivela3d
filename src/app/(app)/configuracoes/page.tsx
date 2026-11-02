import { requireOwner } from "@/lib/guard";
import { SubmitButton } from "@/components/SubmitButton";
import { DeleteButton } from "@/components/DeleteButton";
import { dv, Field, Flash, PageHeader } from "@/components/ui";
import { getChannels, getSettings } from "@/lib/data";
import { money, pct } from "@/lib/format";
import { deleteChannel, saveChannel, saveSettings } from "../actions";

export const metadata = { title: "Custos e canais" };

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string }>;
}) {
  await requireOwner();
  const sp = await searchParams;
  const [s, channels] = await Promise.all([getSettings(), getChannels()]);

  return (
    <>
      <PageHeader
        title="Custos e canais"
        description="Esses valores são usados em todos os cálculos. Ajuste uma vez e o Nivela faz o resto."
      />
      <Flash ok={sp.ok} erro={sp.erro} />

      <div className="grid gap-6 lg:grid-cols-2">
        <form action={saveSettings} className="card space-y-4 p-6">
          <h2 className="text-lg font-bold">Seus custos</h2>
          <Field label="Nome do seu negócio" name="business_name" defaultValue={s.business_name ?? ""} placeholder="Opcional" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Energia elétrica"
              name="energy_price_kwh"
              prefix="R$"
              suffix="/kWh"
              inputMode="decimal"
              defaultValue={dv(s.energy_price_kwh)}
              hint="Veja na sua conta de luz: valor total ÷ kWh consumidos."
            />
            <Field
              label="Sua hora de trabalho"
              name="labor_per_hour"
              prefix="R$"
              suffix="/h"
              inputMode="decimal"
              defaultValue={dv(s.labor_per_hour)}
              hint="Quanto vale uma hora do seu tempo."
            />
            <Field
              label="Taxa de falhas"
              name="failure_rate_pct"
              suffix="%"
              inputMode="decimal"
              defaultValue={dv(s.failure_rate_pct)}
              hint="Reimpressões e peças perdidas. 10% é um bom começo."
            />
            <Field
              label="Margem desejada"
              name="default_margin_pct"
              suffix="%"
              inputMode="decimal"
              defaultValue={dv(s.default_margin_pct)}
              hint="Quanto do preço final deve sobrar como lucro."
            />
          </div>
          <SubmitButton>Salvar custos</SubmitButton>
        </form>

        <section className="card p-6">
          <h2 className="text-lg font-bold">Canais de venda</h2>
          <p className="mt-1 text-sm text-muted">
            Cadastre a comissão de cada lugar onde você vende. Confira as taxas atuais na sua conta de cada
            marketplace — elas mudam com frequência.
          </p>
          <ul className="mt-5 divide-y divide-line">
            {channels.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-3">
                <div className="flex-1">
                  <p className="font-semibold">{c.name}</p>
                  <p className="tnum text-sm text-muted">
                    {pct(c.fee_pct)} + {money(c.fee_fixed)} por venda
                  </p>
                </div>
                <DeleteButton id={c.id} action={deleteChannel} confirmText={`Remover o canal ${c.name}?`} />
              </li>
            ))}
          </ul>
          <form action={saveChannel} className="mt-4 grid gap-3 rounded-xl bg-surface-2 p-4 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-end">
            <Field label="Canal" name="name" placeholder="Ex.: Shopee" required />
            <Field label="Comissão" name="fee_pct" suffix="%" inputMode="decimal" defaultValue="0" />
            <Field label="Taxa fixa" name="fee_fixed" prefix="R$" inputMode="decimal" defaultValue="0" />
            <SubmitButton>Adicionar</SubmitButton>
          </form>
        </section>
      </div>
    </>
  );
}
