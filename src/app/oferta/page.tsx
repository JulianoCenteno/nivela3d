import type { Metadata } from "next";
import { SalesPage } from "@/components/SalesPage";

/** Página de upsell externo do Digital Hub (link colocado no funil de outros produtos). */
export const metadata: Metadata = {
  title: "Nivela 3D — Oferta para quem acabou de comprar",
  description: "Você já tem os arquivos. Agora descubra quanto realmente sobra em cada peça que imprimir.",
  robots: { index: false, follow: false },
};

/** Só aceita voltar para o próprio Digital Hub (evita redirecionamento aberto). */
function safeDecline(v: string | string[] | undefined) {
  const s = Array.isArray(v) ? v[0] : v;
  if (!s) return undefined;
  try {
    const u = new URL(s);
    return u.protocol === "https:" && (u.hostname === "appdigitalhub.com.br" || u.hostname.endsWith(".appdigitalhub.com.br")) ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

export default async function OfertaUpsell({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  return <SalesPage upsell declineUrl={safeDecline(sp.volta)} />;
}
