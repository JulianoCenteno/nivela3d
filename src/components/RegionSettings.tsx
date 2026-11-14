"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { CURRENCIES, CURRENCY_COOKIE, type Currency } from "@/i18n/config";
import { useI18n } from "@/i18n/client";
import { LanguageSwitcher } from "./LanguageSwitcher";

/** Idioma e moeda (cookies por navegador). */
export function RegionSettings() {
  const { t, currency } = useI18n();
  const s = t.manage.settings;
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <section className="card space-y-4 p-6">
      <div>
        <h2 className="text-lg font-bold">{s.region}</h2>
        <p className="mt-1 text-sm text-muted">{s.regionText}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <span className="label">{t.common.nav.language}</span>
          <LanguageSwitcher className="input w-full px-3 text-ink" />
        </div>
        <div>
          <label className="label" htmlFor="currency">{s.currency}</label>
          <select
            id="currency"
            className="input"
            value={currency}
            disabled={pending}
            onChange={(e) => {
              const c = e.target.value as Currency;
              document.cookie = `${CURRENCY_COOKIE}=${c}; path=/; max-age=31536000; samesite=lax`;
              start(() => router.refresh());
            }}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <p className="hint">{s.currencyHint}</p>
        </div>
      </div>
    </section>
  );
}
