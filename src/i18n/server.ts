import "server-only";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import {
  CURRENCY_COOKIE,
  DEFAULT_CURRENCY,
  isCurrency,
  isLocale,
  LOCALE_COOKIE,
  localeFromAcceptLanguage,
  type Locale,
} from "./config";
import { dictFor } from "./dict";
import { makeFmt } from "./format";

/** Idioma e moeda da requisição: cookie → navegador → português. */
export const getI18n = cache(async (forced?: Locale) => {
  const jar = await cookies();
  let locale: Locale;
  if (forced) locale = forced;
  else {
    const c = jar.get(LOCALE_COOKIE)?.value;
    locale = isLocale(c) ? c : localeFromAcceptLanguage((await headers()).get("accept-language"));
  }
  const cc = jar.get(CURRENCY_COOKIE)?.value;
  const currency = isCurrency(cc) ? cc : DEFAULT_CURRENCY[locale];
  return { locale, currency, t: dictFor(locale), fmt: makeFmt(locale, currency) };
});

export async function getT() {
  return (await getI18n()).t;
}
