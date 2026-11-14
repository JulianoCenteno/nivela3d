import type { Metadata, Viewport } from "next";
import { themeScript } from "@/components/ThemeToggle";
import { I18nProvider } from "@/i18n/client";
import { LOCALE_TAG } from "@/i18n/config";
import { getI18n } from "@/i18n/server";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: { default: "Nivela 3D", template: "%s · Nivela 3D" },
    description: t.landing.footer,
    icons: { icon: "/brand/icone.svg" },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ee" },
    { media: "(prefers-color-scheme: dark)", color: "#10191c" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, currency } = await getI18n();
  return (
    <html lang={LOCALE_TAG[locale]} className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-dvh antialiased">
        <I18nProvider locale={locale} currency={currency}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
