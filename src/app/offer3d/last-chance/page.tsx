import type { Metadata } from "next";
import { Central3DOffer } from "@/components/landing/Central3DOffer";
import { safeDecline } from "@/lib/safe-decline";

/** Downsell em inglês (US$) do Nivela 3D. */
export const metadata: Metadata = {
  title: "Nivela 3D — Last chance",
  description: "The same Nivela 3D Complete, lifetime access, for a fraction of the price.",
  robots: { index: false, follow: false },
};

export default async function Offer3DDownsell({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  return <Central3DOffer variant="down" locale="en" declineUrl={safeDecline(sp.volta)} acceptUrl={safeDecline(sp.sim)} />;
}
