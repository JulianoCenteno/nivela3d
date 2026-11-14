"use client";

import { Globe } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LOCALE_COOKIE, LOCALE_LABEL, LOCALES, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/client";

/** Troca o idioma do app (cookie de 1 ano) e recarrega a página. */
export function LanguageSwitcher({ className = "", onChange }: { className?: string; onChange?: (l: Locale) => void }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <label className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted ${className}`}>
      <Globe size={18} aria-hidden="true" />
      <span className="sr-only">{t.common.nav.language}</span>
      <select
        value={locale}
        disabled={pending}
        aria-label={t.common.nav.language}
        onChange={(e) => {
          const next = e.target.value as Locale;
          document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
          onChange?.(next);
          start(() => router.refresh());
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
