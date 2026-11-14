import type { Metadata } from "next";
import { SalesPage } from "@/components/SalesPage";
import landing from "@/i18n/messages/landing";

const L = landing.en;

export const metadata: Metadata = {
  title: L.meta.title,
  description: L.meta.desc,
  alternates: { languages: { "pt-BR": "/", "en-US": "/en", "es-419": "/es" } },
};

export default function Landing() {
  return <SalesPage locale="en" />;
}
