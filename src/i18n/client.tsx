"use client";

import { createContext, useContext, useMemo } from "react";
import type { Currency, Locale } from "./config";
import { dictFor } from "./dict";
import { makeFmt } from "./format";

const Ctx = createContext<{ locale: Locale; currency: Currency }>({ locale: "pt", currency: "BRL" });

export function I18nProvider({ locale, currency, children }: { locale: Locale; currency: Currency; children: React.ReactNode }) {
  const value = useMemo(() => ({ locale, currency }), [locale, currency]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const { locale, currency } = useContext(Ctx);
  return { locale, currency, t: dictFor(locale), fmt: makeFmt(locale, currency) };
}
