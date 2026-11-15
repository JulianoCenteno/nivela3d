import type { Metadata } from "next";
import { Central3DOffer } from "@/components/landing/Central3DOffer";
import { safeDecline } from "@/lib/safe-decline";

/** Upsell em inglês (US$) do Nivela 3D para funis de produtos 3D (ex.: STL Católico EN). */
export const metadata: Metadata = {
  title: "Nivela 3D — Exclusive offer for new customers",
  description: "Find out how much you really make on every 3D print. Nivela 3D Complete, lifetime access.",
  robots: { index: false, follow: false },
};

export default async function Offer3DUpsell({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  return <Central3DOffer variant="up" locale="en" declineUrl={safeDecline(sp.volta)} acceptUrl={safeDecline(sp.sim)} />;
}
