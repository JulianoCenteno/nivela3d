import type { Metadata } from "next";
import { Central3DOffer } from "@/components/landing/Central3DOffer";
import { safeDecline } from "@/lib/safe-decline";

/** Upsell do Nivela 3D (R$ 47) no funil da Central 3D. */
export const metadata: Metadata = {
  title: "Nivela 3D — Oferta exclusiva para quem comprou a Central 3D",
  description: "Descubra quanto realmente lucra com cada peça 3D. Nivela 3D Completo, acesso vitalício.",
  robots: { index: false, follow: false },
};

export default async function Central3DUpsell({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  return <Central3DOffer variant="up" declineUrl={safeDecline(sp.volta)} />;
}
