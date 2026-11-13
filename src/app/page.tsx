import type { Metadata } from "next";
import { SalesPage } from "@/components/SalesPage";

export const metadata: Metadata = {
  title: "Nivela 3D — Descubra quanto realmente sobra em cada impressão",
  description:
    "Vender mais não significa lucrar mais. Com o Raio-X do Lucro 3D você encontra os custos escondidos, cobra o preço certo e vê o lucro real de cada peça. A partir de R$ 19,90, pagamento único e acesso vitalício.",
};

export default function Landing() {
  return <SalesPage />;
}
