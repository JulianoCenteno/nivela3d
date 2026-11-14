import { LOCALE_TAG, type Currency, type Locale } from "./config";

export interface Fmt {
  locale: Locale;
  currency: Currency;
  money: (v: number | null | undefined) => string;
  number: (v: number | null | undefined) => string;
  pct: (v: number | null | undefined) => string;
  date: (v: string | Date, opts?: Intl.DateTimeFormatOptions) => string;
  /** Símbolo da moeda (R$, $, €…) para rótulos de campo. */
  symbol: string;
  /** Data curta de um "AAAA-MM-DD" sem mexer no fuso (dd/mm/aa ou mm/dd/aa). */
  short: (iso: string) => string;
  /** Valor inicial de input numérico no formato do idioma (vírgula ou ponto). */
  dv: (v: number | null | undefined) => string;
  /** Separador decimal do idioma. */
  decimal: string;
  /** Placeholder "0,00" / "0.00". */
  zero: string;
}

const cache = new Map<string, Fmt>();

export function makeFmt(locale: Locale, currency: Currency): Fmt {
  const key = `${locale}:${currency}`;
  const hit = cache.get(key);
  if (hit) return hit;
  const tag = LOCALE_TAG[locale];
  const cur = new Intl.NumberFormat(tag, { style: "currency", currency });
  const num = new Intl.NumberFormat(tag, { maximumFractionDigits: 2 });
  const symbol = cur.formatToParts(0).find((p) => p.type === "currency")?.value ?? currency;
  const fmt: Fmt = {
    locale,
    currency,
    symbol,
    money: (v) => cur.format(Number(v) || 0),
    number: (v) => num.format(Number(v) || 0),
    pct: (v) => `${num.format(Number(v) || 0)}%`,
    date: (v, opts) =>
      new Date(v).toLocaleDateString(tag, { timeZone: "America/Sao_Paulo", ...opts }),
    short: (iso) => {
      const [y, m, d] = iso.slice(0, 10).split("-");
      return locale === "en" ? `${m}/${d}/${y.slice(2)}` : `${d}/${m}/${y.slice(2)}`;
    },
    dv: (v) => {
      if (v == null) return "";
      const s = String(Math.round(Number(v) * 10000) / 10000);
      return locale === "en" ? s : s.replace(".", ",");
    },
    decimal: locale === "en" ? "." : ",",
    zero: locale === "en" ? "0.00" : "0,00",
  };
  cache.set(key, fmt);
  return fmt;
}
