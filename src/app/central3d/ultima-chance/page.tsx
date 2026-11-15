import type { Metadata } from "next";
import { Central3DOffer } from "@/components/landing/Central3DOffer";
import { safeDecline } from "@/lib/safe-decline";

/** Downsell do Nivela 3D (R$ 17) no funil da Central 3D. */
export const metadata: Metadata = {
  title: "Nivela 3D — Última chance",
  description: "O mesmo Nivela 3D Completo, acesso vitalício, por R$ 17.",
  robots: { index: false, follow: false },
};

export default async function Central3DDownsell({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  return <Central3DOffer variant="down" declineUrl={safeDecline(sp.volta)} acceptUrl={safeDecline(sp.sim)} />;
}
