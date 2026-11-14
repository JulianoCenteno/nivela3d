"use client";

import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, LOCALE_LABEL, LOCALES, type Locale } from "@/i18n/config";

const PATH: Record<Locale, string> = { pt: "/", en: "/en", es: "/es" };

/** Troca a página de vendas entre /, /en e /es (e grava o idioma para o app). */
export function LandingLangSwitcher({ locale, upsell = false }: { locale: Locale; upsell?: boolean }) {
  const router = useRouter();
  return (
    <label className="inline-flex items-center gap-1.5 rounded-xl px-2 py-2 text-sm font-medium text-muted">
      <Globe size={17} aria-hidden="true" />
      <select
        value={locale}
        aria-label="Language"
        onChange={(e) => {
          const next = e.target.value as Locale;
          document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
          const base = upsell ? `/oferta${next === "pt" ? "" : `/${next}`}` : PATH[next];
          router.push(base + window.location.search);
        }}
        className="cursor-pointer bg-transparent font-medium text-ink-2 outline-none"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {LOCALE_LABEL[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
