import type { Metadata } from "next";
import { SalesPage } from "@/components/SalesPage";
import landing from "@/i18n/messages/landing";
import { safeDecline } from "@/lib/safe-decline";

const L = landing.en;

export const metadata: Metadata = {
  title: L.meta.upsellTitle,
  description: L.meta.upsellDesc,
  robots: { index: false, follow: false },
};

export default async function OfertaUpsell({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  return <SalesPage upsell locale="en" declineUrl={safeDecline(sp.volta)} />;
}
