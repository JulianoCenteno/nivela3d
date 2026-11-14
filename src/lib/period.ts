/** Utilitários de período (mês) no fuso de São Paulo. */
const TZ = "America/Sao_Paulo";

export function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date());
}

/** "2026-11" → { from: "2026-11-01", to: "2026-11-30", label: "novembro de 2026" } */
export function monthRange(ym?: string, tag = "pt-BR") {
  const valid = ym && /^\d{4}-\d{2}$/.test(ym) ? ym : todayISO().slice(0, 7);
  const [y, m] = valid.split("-").map(Number);
  const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const label = new Intl.DateTimeFormat(tag, { month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(Date.UTC(y, m - 1, 15)),
  );
  return { ym: valid, label: label.charAt(0).toUpperCase() + label.slice(1), from: `${valid}-01`, to: `${valid}-${String(last).padStart(2, "0")}` };
}

export function shiftMonth(ym: string, delta: number) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export const fmtDate = (iso: string) => {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y.slice(2)}`;
};
