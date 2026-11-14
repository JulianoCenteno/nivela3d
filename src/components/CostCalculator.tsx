"use client";

import { AlertTriangle, ChevronDown, Plus, X } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { calcCost, evaluatePrice, suggestPrice, suppliesCost, type SupplyUse } from "@/lib/calc";
import type { ChannelRow, MaterialRow, PrinterRow, Settings, SupplyRow } from "@/lib/data";
import { parseNum } from "@/lib/format";
import { useI18n } from "@/i18n/client";

export interface CalcInitial {
  printer_id?: string | null;
  material_id?: string | null;
  weight_g?: number;
  print_hours?: number;
  labor_minutes?: number;
  extra_costs?: number;
  sale_price?: number;
  supplies?: SupplyUse[];
}


export function CostCalculator({
  printers,
  materials,
  channels,
  settings,
  supplies = [],
  initial = {},
  withPriceField = false,
}: {
  printers: PrinterRow[];
  materials: MaterialRow[];
  channels: ChannelRow[];
  settings: Settings;
  supplies?: SupplyRow[];
  initial?: CalcInitial;
  /** No cadastro de produto, o preço escolhido é enviado no formulário. */
  withPriceField?: boolean;
}) {
  const { t, fmt } = useI18n();
  const c = t.products.calc;
  const { money, pct } = fmt;
  const toStr = (v: number | undefined | null) => (v == null || v === 0 ? "" : fmt.dv(Math.round(v * 100) / 100));
  const [printerId, setPrinterId] = useState(initial.printer_id ?? printers[0]?.id ?? "");
  const [materialId, setMaterialId] = useState(initial.material_id ?? materials[0]?.id ?? "");
  const [manualKg, setManualKg] = useState("");
  const [weight, setWeight] = useState(toStr(initial.weight_g));
  const ih = initial.print_hours ?? 0;
  const [hours, setHours] = useState(ih ? String(Math.floor(ih)) : "");
  const [minutes, setMinutes] = useState(ih ? String(Math.round((ih % 1) * 60)) : "");
  const [labor, setLabor] = useState(toStr(initial.labor_minutes));
  const [extras, setExtras] = useState(toStr(initial.extra_costs));
  const [channelId, setChannelId] = useState(channels[0]?.id ?? "");
  const [margin, setMargin] = useState(fmt.dv(settings.default_margin_pct));
  const [myPrice, setMyPrice] = useState(toStr(initial.sale_price));
  const [showDetail, setShowDetail] = useState(false);
  const [uses, setUses] = useState<{ supply_id: string; qty: string }[]>(
    (initial.supplies ?? []).map((u) => ({ supply_id: u.supply_id, qty: fmt.dv(u.qty) })),
  );
  const usesParsed: SupplyUse[] = uses
    .map((u) => ({ supply_id: u.supply_id, qty: parseNum(u.qty) }))
    .filter((u) => u.supply_id && u.qty > 0);
  const supplyPrices = useMemo(() => new Map(supplies.map((x) => [x.id, x.unit_price])), [supplies]);
  const supCost = suppliesCost(usesParsed, supplyPrices);

  const printer = printers.find((p) => p.id === printerId);
  const material = materials.find((m) => m.id === materialId);
  const channel = channels.find((c) => c.id === channelId);
  const printHours = parseNum(hours) + parseNum(minutes) / 60;
  const fee = { feePct: channel?.fee_pct ?? 0, feeFixed: channel?.fee_fixed ?? 0 };

  const cost = useMemo(
    () =>
      calcCost({
        weightG: parseNum(weight),
        printHours,
        materialPricePerKg: material ? material.price_per_kg : parseNum(manualKg),
        printerWatts: printer?.power_watts ?? 0,
        energyPricePerKwh: settings.energy_price_kwh,
        printerPrice: printer?.purchase_price ?? 0,
        printerLifetimeHours: printer?.lifetime_hours ?? 0,
        maintenancePerHour: printer?.maintenance_per_hour ?? 0,
        laborMinutes: parseNum(labor),
        laborPerHour: settings.labor_per_hour,
        failureRatePct: settings.failure_rate_pct,
        extraCosts: parseNum(extras),
        suppliesCost: supCost,
      }),
    [weight, printHours, material, manualKg, printer, labor, extras, settings, supCost],
  );

  const suggested = suggestPrice(cost.total, parseNum(margin), fee);
  const mine = parseNum(myPrice) > 0 ? evaluatePrice(parseNum(myPrice), cost.total, fee) : null;
  const hasInput = parseNum(weight) > 0 || printHours > 0;

  const rows: [string, number][] = [
    [c.rows.material, cost.material],
    [c.rows.energy, cost.energy],
    [c.rows.wear, cost.depreciation],
    [c.rows.maintenance, cost.maintenance],
    [c.rows.failures(pct(settings.failure_rate_pct)), cost.failure],
    [c.rows.labor, cost.labor],
    [c.rows.supplies, cost.supplies],
    [c.rows.extras, cost.extras],
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      {/* -------- Entradas -------- */}
      <div className="card space-y-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="printer_id">{c.printer}</label>
            <select id="printer_id" name="printer_id" className="input" value={printerId} onChange={(e) => setPrinterId(e.target.value)}>
              {printers.length === 0 && <option value="">{c.noPrinter}</option>}
              {printers.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="material_id">{c.material}</label>
            <select id="material_id" name="material_id" className="input" value={materialId} onChange={(e) => setMaterialId(e.target.value)}>
              {materials.map((m) => <option key={m.id} value={m.id}>{m.name} — {money(m.price_per_kg)}/kg</option>)}
              <option value="">{c.manualPrice}</option>
            </select>
          </div>
          {!material && (
            <Num label={c.materialPrice} value={manualKg} onChange={setManualKg} prefix={fmt.symbol} suffix="/kg" />
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Num label={c.weight} name="weight_g" value={weight} onChange={setWeight} suffix="g" hint={c.weightHint} />
          <div>
            <span className="label">{c.time}</span>
            <div className="grid grid-cols-2 gap-2">
              <Num value={hours} onChange={setHours} suffix="h" ariaLabel={c.hoursAria} />
              <Num value={minutes} onChange={setMinutes} suffix="min" ariaLabel={c.minutesAria} />
            </div>
          </div>
          <input type="hidden" name="print_hours" value={String(printHours)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Num label={c.labor} name="labor_minutes" value={labor} onChange={setLabor} suffix="min" hint={c.laborHint} />
          <Num label={c.extras} name="extra_costs" value={extras} onChange={setExtras} prefix={fmt.symbol} hint={c.extrasHint} />
        </div>

        <div>
          <div className="flex items-baseline justify-between">
            <span className="label">{c.supplies}</span>
            {uses.length > 0 && <span className="tnum text-sm font-semibold text-muted">{money(supCost)}</span>}
          </div>
          <input type="hidden" name="supplies" value={JSON.stringify(usesParsed)} />
          {supplies.length === 0 ? (
            <p className="rounded-xl bg-surface-2 px-4 py-3 text-sm text-muted">
              {c.noSupplies}{" "}
              <Link href="/insumos" className="font-semibold text-primary hover:underline">{c.addSupplies}</Link> {c.toUseHere}
            </p>
          ) : (
            <div className="space-y-2">
              {uses.map((u, i) => {
                const sup = supplies.find((x) => x.id === u.supply_id);
                return (
                  <div key={i} className="grid grid-cols-[1fr_90px_auto] items-center gap-2">
                    <select
                      aria-label={c.supply}
                      className="input"
                      value={u.supply_id}
                      onChange={(e) => setUses(uses.map((x, j) => (j === i ? { ...x, supply_id: e.target.value } : x)))}
                    >
                      {supplies.map((x) => (
                        <option key={x.id} value={x.id}>{x.name} — {money(x.unit_price)}/{x.unit}</option>
                      ))}
                    </select>
                    <div className="relative">
                      <input
                        aria-label={c.qty}
                        inputMode="decimal"
                        className="input tnum pr-9"
                        value={u.qty}
                        onChange={(e) => setUses(uses.map((x, j) => (j === i ? { ...x, qty: e.target.value.replace(/[^\d.,]/g, "") } : x)))}
                      />
                      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted">{sup?.unit ?? c.unit}</span>
                    </div>
                    <button type="button" onClick={() => setUses(uses.filter((_, j) => j !== i))} className="rounded-lg p-2 text-muted hover:bg-surface-2 hover:text-negative" aria-label={c.removeSupply}>
                      <X size={18} />
                    </button>
                  </div>
                );
              })}
              <button
                type="button"
                onClick={() => setUses([...uses, { supply_id: (supplies.find((x) => !uses.some((u) => u.supply_id === x.id)) ?? supplies[0]).id, qty: "1" }])}
                className="inline-flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-sm font-semibold text-primary hover:bg-primary-soft"
              >
                <Plus size={16} /> {c.addSupply}
              </button>
            </div>
          )}
        </div>

        <div className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="channel">{c.channel}</label>
            <select id="channel" className="input" value={channelId} onChange={(e) => setChannelId(e.target.value)}>
              {channels.map((c) => <option key={c.id} value={c.id}>{c.name} ({pct(c.fee_pct)} + {money(c.fee_fixed)})</option>)}
            </select>
          </div>
          <Num label={c.margin} value={margin} onChange={setMargin} suffix="%" />
        </div>

        {printers.length === 0 && (
          <p className="flex items-start gap-2 rounded-xl bg-sand-soft px-4 py-3 text-sm text-ink-2">
            <AlertTriangle size={18} className="mt-px shrink-0" />
            {c.noPrinterWarn}
          </p>
        )}
      </div>

      {/* -------- Resultado -------- */}
      <div className="space-y-4 lg:sticky lg:top-6 lg:h-fit">
        <div className="card overflow-hidden">
          <div className="bg-[#182B30] p-6 text-[#F5F3EE] dark:bg-[#2B4743]">
            <p className="text-sm font-semibold text-[#F5F3EE]/70">{c.suggested}</p>
            <p className="tnum mt-1 text-4xl font-extrabold tracking-tight">
              {!hasInput ? "—" : suggested ? money(suggested.price) : c.impossible}
            </p>
            {hasInput && suggested && (
              <p className="tnum mt-2 text-sm text-[#F5F3EE]/80">
                {c.profitLead} <b className="text-[#A9C2B5]">{money(suggested.profit)}</b> {c.perPiece(pct(suggested.marginPct))}{" "}
                {money(suggested.fee)} {c.inFees}
              </p>
            )}
            {hasInput && !suggested && (
              <p className="mt-2 text-sm text-[#F5F3EE]/80">{c.tooHigh}</p>
            )}
          </div>
          <div className="p-6">
            <div className="flex items-baseline justify-between">
              <p className="font-semibold text-muted">{c.totalCost}</p>
              <p className="tnum text-xl font-extrabold">{money(cost.total)}</p>
            </div>
            <button type="button" onClick={() => setShowDetail((v) => !v)} className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary">
              {showDetail ? c.hide : c.show}
              <ChevronDown size={16} className={`transition ${showDetail ? "rotate-180" : ""}`} />
            </button>
            {showDetail && (
              <ul className="mt-3 space-y-2 text-sm">
                {rows.map(([label, v]) => (
                  <li key={label} className="flex justify-between">
                    <span className="text-muted">{label}</span>
                    <span className="tnum font-semibold">{money(v)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="card p-6">
          <Num
            label={withPriceField ? c.salePrice : c.testPrice}
            name={withPriceField ? "sale_price" : undefined}
            value={myPrice}
            onChange={setMyPrice}
            prefix={fmt.symbol}
          />
          {withPriceField && !myPrice && suggested && (
            <button type="button" onClick={() => setMyPrice(toStr(suggested.price))} className="mt-2 text-sm font-semibold text-primary">
              {c.useSuggested(money(suggested.price))}
            </button>
          )}
          {mine && (
            <div className={`mt-4 rounded-xl p-4 ${mine.profit < 0 ? "bg-negative-soft" : "bg-primary-soft"}`}>
              <p className={`text-sm font-semibold ${mine.profit < 0 ? "text-negative" : "text-primary"}`}>
                {mine.profit < 0 ? c.loss : c.yourProfit}
              </p>
              <p className={`tnum mt-1 text-2xl font-extrabold ${mine.profit < 0 ? "text-negative" : "text-primary"}`}>
                {money(mine.profit)} <span className="text-base font-bold">({pct(mine.marginPct)})</span>
              </p>
              <p className="tnum mt-1 text-xs text-muted">{c.channelFees(money(mine.fee))}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Num({
  label,
  name,
  value,
  onChange,
  prefix,
  suffix,
  hint,
  ariaLabel,
}: {
  label?: string;
  name?: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  hint?: string;
  ariaLabel?: string;
}) {
  const id = name ?? ariaLabel ?? label ?? "campo";
  return (
    <div>
      {label && <label className="label" htmlFor={id}>{label}</label>}
      <div className="relative">
        {prefix && <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm text-muted">{prefix}</span>}
        <input
          id={id}
          name={name}
          aria-label={ariaLabel}
          inputMode="decimal"
          autoComplete="off"
          className={`input tnum ${prefix ? "pl-10" : ""} ${suffix ? "pr-14" : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ""))}
          placeholder="0"
        />
        {suffix && <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-muted">{suffix}</span>}
      </div>
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}
