import { redirect } from "next/navigation";
import { QuoteOrderForm } from "@/components/QuoteOrderForm";
import { Flash, PageHeader } from "@/components/ui";
import { getChannels, getContext, getProducts } from "@/lib/data";
import { hasFeature } from "@/lib/plans";
import { saveQuote } from "../../gestao-actions";

export const metadata = { title: "Novo orçamento" };

export default async function NewQuotePage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const sp = await searchParams;
  const { plan } = await getContext();
  if (!hasFeature(plan, "gestao")) redirect("/orcamentos");
  const [products, channels] = await Promise.all([getProducts(), getChannels()]);
  const valid = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
  return (
    <>
      <PageHeader title="Novo orçamento" description="Escolha as peças do catálogo ou digite itens avulsos. O total e a sobra aparecem na hora." />
      <Flash erro={sp.erro} />
      <QuoteOrderForm mode="quote" action={saveQuote} products={products} channels={channels} defaultValidUntil={valid} />
    </>
  );
}
