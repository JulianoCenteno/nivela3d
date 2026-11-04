import type { Metadata } from "next";
import { SalesPage } from "@/components/SalesPage";

/** Página de upsell: link colocado na página de obrigado de outros produtos. */
export const metadata: Metadata = {
  title: "Nivela 3D — Oferta para quem acabou de comprar",
  description: "Você já tem os arquivos. Agora descubra quanto realmente sobra em cada peça que imprimir.",
  robots: { index: false, follow: false },
};

export default function OfertaUpsell() {
  return <SalesPage upsell />;
}
