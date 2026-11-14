export const LOCALES = ["pt", "en", "es"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "pt";
export const LOCALE_COOKIE = "nivela_locale";
export const CURRENCY_COOKIE = "nivela_currency";

export const LOCALE_LABEL: Record<Locale, string> = { pt: "Português", en: "English", es: "Español" };
/** Código BCP-47 usado para datas e números. */
export const LOCALE_TAG: Record<Locale, string> = { pt: "pt-BR", en: "en-US", es: "es-419" };

export const CURRENCIES = ["BRL", "USD", "EUR", "MXN", "ARS", "COP", "CLP", "PEN", "UYU", "PYG", "GBP", "CAD", "AUD"] as const;
export type Currency = (typeof CURRENCIES)[number];
export const DEFAULT_CURRENCY: Record<Locale, Currency> = { pt: "BRL", en: "USD", es: "USD" };

export function isLocale(v: unknown): v is Locale {
  return typeof v === "string" && (LOCALES as readonly string[]).includes(v);
}
export function isCurrency(v: unknown): v is Currency {
  return typeof v === "string" && (CURRENCIES as readonly string[]).includes(v);
}

/** Escolhe o idioma pelo cabeçalho Accept-Language ("es-MX,es;q=0.9,en;q=0.8"). */
export function localeFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;
  const langs = header
    .split(",")
    .map((p) => {
      const [tag, q] = p.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? Number(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of langs) {
    const base = tag.split("-")[0];
    if (isLocale(base)) return base;
  }
  return DEFAULT_LOCALE;
}
