import type { Metadata } from "next";
import { SalesPage } from "@/components/SalesPage";
import { safeDecline } from "@/lib/safe-decline";

/** Página de upsell externo do Digital Hub (link colocado no funil de outros produtos). */
export const metadata: Metadata = {
  title: "Nivela 3D — Oferta para quem acabou de comprar",
  description: "Você já tem os arquivos. Agora descubra quanto realmente sobra em cada peça que imprimir.",
  robots: { index: false, follow: false },
};

export default async function OfertaUpsell({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  return <SalesPage upsell declineUrl={safeDecline(sp.volta)} />;
}
