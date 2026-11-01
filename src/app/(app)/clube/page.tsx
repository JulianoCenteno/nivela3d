import { BadgePercent, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/ui";

export const metadata = { title: "Clube de Ofertas 3D" };

export default function ClubPage() {
  const whatsapp = process.env.NEXT_PUBLIC_CLUBE_WHATSAPP;
  const telegram = process.env.NEXT_PUBLIC_CLUBE_TELEGRAM;
  return (
    <>
      <PageHeader
        title="Clube de Ofertas 3D"
        description="Promoções selecionadas de filamentos, peças e ferramentas para quem vive de impressão 3D."
      />
      <div className="card flex flex-col gap-6 p-8 md:flex-row md:items-center">
        <div className="rounded-2xl bg-sand-soft p-5 text-ink-2">
          <BadgePercent size={36} />
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold">Incluso em todos os planos</p>
          <p className="mt-1 max-w-xl text-muted">
            Publicamos poucas ofertas por dia, só o que vale a pena. Alguns links são de afiliado: se você comprar por
            eles, recebemos uma comissão, sem custo extra para você.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row md:flex-col">
          {whatsapp && (
            <a href={whatsapp} target="_blank" rel="noopener" className="btn-primary">
              Entrar no grupo do WhatsApp <ExternalLink size={16} />
            </a>
          )}
          {telegram && (
            <a href={telegram} target="_blank" rel="noopener" className="btn-ghost">
              Entrar no Telegram <ExternalLink size={16} />
            </a>
          )}
          {!whatsapp && !telegram && <span className="text-sm font-semibold text-muted">Link do grupo em breve</span>}
        </div>
      </div>
    </>
  );
}
