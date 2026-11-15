import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

/** Gráfico de rosca simples em SVG (sem biblioteca). */
export function Donut({
  parts,
  center,
  sub,
  size = 168,
}: {
  parts: { label: string; value: number; color: string }[];
  center: string;
  sub: string;
  size?: number;
}) {
  const total = parts.reduce((a, p) => a + p.value, 0);
  const r = 15.9155;
  let acc = 0;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
        <circle cx="18" cy="18" r={r} fill="none" stroke="var(--color-surface-2, #eef1ef)" strokeWidth="4" />
        {total > 0 &&
          parts.map((p) => {
            const len = (p.value / total) * 100;
            const el = (
              <circle
                key={p.label}
                cx="18"
                cy="18"
                r={r}
                fill="none"
                stroke={p.color}
                strokeWidth="4"
                strokeDasharray={`${len} ${100 - len}`}
                strokeDashoffset={-acc}
              >
                <title>{p.label}</title>
              </circle>
            );
            acc += len;
            return el;
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="tnum text-base font-extrabold">{center}</span>
        <span className="text-xs text-muted">{sub}</span>
      </div>
    </div>
  );
}

/** Barras de faturamento por dia, com o lucro desenhado por cima. */
export function DailyBars({
  days,
  fmtMoney,
  fmtDay,
}: {
  days: { date: string; revenue: number; profit: number }[];
  fmtMoney: (v: number) => string;
  fmtDay: (iso: string) => string;
}) {
  const max = Math.max(1, ...days.map((d) => d.revenue));
  return (
    <div>
      <div className="flex h-40 items-end gap-[3px] sm:h-56 lg:h-72">
        {days.map((d) => (
          <div key={d.date} className="group relative flex h-full flex-1 items-end" title={`${fmtDay(d.date)} · ${fmtMoney(d.revenue)}`}>
            <div className="w-full rounded-t-[4px] bg-teal/25" style={{ height: `${(d.revenue / max) * 100}%`, minHeight: d.revenue > 0 ? 3 : 0 }}>
              <div className="w-full rounded-t-[4px] bg-gradient-to-t from-primary to-teal" style={{ height: `${d.revenue > 0 ? Math.max(0, Math.min(100, (d.profit / d.revenue) * 100)) : 0}%`, marginTop: "auto" }} />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] text-muted">
        <span>{fmtDay(days[0]?.date ?? "")}</span>
        <span>{fmtDay(days[Math.floor(days.length / 2)]?.date ?? "")}</span>
        <span>{fmtDay(days[days.length - 1]?.date ?? "")}</span>
      </div>
    </div>
  );
}

export function Progress({ pct, tone = "primary" }: { pct: number; tone?: "primary" | "positive" }) {
  return (
    <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
      <div className={`h-full rounded-full bg-gradient-to-r ${tone === "positive" ? "from-positive to-teal" : "from-primary to-blue"}`} style={{ width: `${Math.max(0, Math.min(100, pct))}%` }} />
    </div>
  );
}

/** Selo de variação (↑ 12% / ↓ 4%) em relação ao período anterior. */
export function Delta({ value, fmtPct, invert = false }: { value: number | null; fmtPct: (v: number) => string; invert?: boolean }) {
  if (value === null || !Number.isFinite(value))
    return (
      <span className="inline-flex items-center gap-0.5 rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] font-bold text-muted">
        <Minus size={11} />
      </span>
    );
  const good = invert ? value <= 0 : value >= 0;
  const Icon = value >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-bold ${good ? "bg-positive/10 text-positive" : "bg-negative-soft text-negative"}`}>
      <Icon size={11} />
      {fmtPct(Math.abs(value))}
    </span>
  );
}

/** Cartão de indicador com ícone e variação. */
export function Kpi({
  icon,
  label,
  value,
  delta,
  hint,
  highlight = false,
  tone,
  accent = "primary",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  delta?: React.ReactNode;
  hint?: string;
  highlight?: boolean;
  tone?: "positive" | "negative";
  accent?: "primary" | "green" | "rose" | "violet" | "blue" | "amber";
}) {
  const ACC = {
    primary: "bg-primary-soft text-primary",
    green: "bg-teal-soft text-positive",
    rose: "bg-rose-soft text-rose",
    violet: "bg-violet-soft text-violet",
    blue: "bg-blue-soft text-blue",
    amber: "bg-amber-soft text-amber",
  }[accent];
  return (
    <div className={`rounded-2xl p-5 ${highlight ? "bg-gradient-to-br from-primary to-primary-2 text-on-primary shadow-[0_14px_30px_-12px_rgba(31,107,92,0.55)]" : "card"}`}>
      <div className="flex items-center gap-3">
        <span className={`rounded-xl p-2.5 ${highlight ? "bg-white/20" : ACC}`}>{icon}</span>
        <p className={`text-sm font-semibold ${highlight ? "text-on-primary/85" : "text-muted"}`}>{label}</p>
      </div>
      <p
        className={`tnum mt-3 text-[1.6rem] font-extrabold tracking-tight ${
          !highlight && tone === "negative" ? "text-negative" : !highlight && tone === "positive" ? "text-positive" : ""
        }`}
      >
        {value}
      </p>
      <div className={`mt-1 flex items-center gap-1.5 text-xs ${highlight ? "text-on-primary/80 [&>span:first-child]:!bg-white/90" : "text-muted"}`}>
        {delta}
        {hint && <span>{hint}</span>}
      </div>
    </div>
  );
}
