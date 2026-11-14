import { requireOwner } from "@/lib/guard";
import { SubmitButton } from "@/components/SubmitButton";
import { DeleteButton } from "@/components/DeleteButton";
import { Field, Flash, PageHeader } from "@/components/ui";
import { RegionSettings } from "@/components/RegionSettings";
import { getChannels, getSettings } from "@/lib/data";
import { deleteChannel, saveChannel, saveSettings } from "../actions";
import { getI18n, getT } from "@/i18n/server";

export async function generateMetadata() {
  return { title: (await getT()).manage.settings.title };
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; erro?: string }>;
}) {
  await requireOwner();
  const sp = await searchParams;
  const [s, channels] = await Promise.all([getSettings(), getChannels()]);
  const { t, fmt } = await getI18n();
  const c_ = t.manage.settings;
  const { money, pct, dv } = fmt;

  return (
    <>
      <PageHeader
        title={c_.title}
        description={c_.desc}
      />
      <Flash ok={sp.ok} erro={sp.erro} />

      <div className="grid gap-6 lg:grid-cols-2">
        <form action={saveSettings} className="card space-y-4 p-6">
          <h2 className="text-lg font-bold">{c_.yourCosts}</h2>
          <Field label={c_.business} name="business_name" defaultValue={s.business_name ?? ""} placeholder={c_.optional} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label={c_.energy}
              name="energy_price_kwh"
              prefix={fmt.symbol}
              suffix="/kWh"
              inputMode="decimal"
              defaultValue={dv(s.energy_price_kwh)}
              hint={c_.energyHint}
            />
            <Field
              label={c_.labor}
              name="labor_per_hour"
              prefix={fmt.symbol}
              suffix="/h"
              inputMode="decimal"
              defaultValue={dv(s.labor_per_hour)}
              hint={c_.laborHint}
            />
            <Field
              label={c_.failure}
              name="failure_rate_pct"
              suffix="%"
              inputMode="decimal"
              defaultValue={dv(s.failure_rate_pct)}
              hint={c_.failureHint}
            />
            <Field
              label={c_.margin}
              name="default_margin_pct"
              suffix="%"
              inputMode="decimal"
              defaultValue={dv(s.default_margin_pct)}
              hint={c_.marginHint}
            />
          </div>
          <SubmitButton>{c_.saveCosts}</SubmitButton>
        </form>

        <section className="card p-6">
          <h2 className="text-lg font-bold">{c_.channels}</h2>
          <p className="mt-1 text-sm text-muted">
            {c_.channelsText}
          </p>
          <ul className="mt-5 divide-y divide-line">
            {channels.map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-3">
                <div className="flex-1">
                  <p className="font-semibold">{c.name}</p>
                  <p className="tnum text-sm text-muted">
                    {c_.perSale(pct(c.fee_pct), money(c.fee_fixed))}
                  </p>
                </div>
                <DeleteButton id={c.id} action={deleteChannel} confirmText={c_.removeChannel(c.name)} />
              </li>
            ))}
          </ul>
          <form action={saveChannel} className="mt-4 grid gap-3 rounded-xl bg-surface-2 p-4 sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-end">
            <Field label={c_.channel} name="name" placeholder={c_.channelPh} required />
            <Field label={c_.fee} name="fee_pct" suffix="%" inputMode="decimal" defaultValue="0" />
            <Field label={c_.fixed} name="fee_fixed" prefix={fmt.symbol} inputMode="decimal" defaultValue="0" />
            <SubmitButton>{t.common.actions.add}</SubmitButton>
          </form>
        </section>
        <div className="lg:col-span-2">
          <RegionSettings />
        </div>
      </div>
    </>
  );
}
