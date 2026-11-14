import { redirect } from "next/navigation";
import { QuoteOrderForm } from "@/components/QuoteOrderForm";
import { Flash, PageHeader } from "@/components/ui";
import { getChannels, getContext, getProducts } from "@/lib/data";
import { hasFeature } from "@/lib/plans";
import { saveQuote } from "../../gestao-actions";
import { getT } from "@/i18n/server";

export async function generateMetadata() {
  return { title: (await getT()).ops.quotes.new };
}

export default async function NewQuotePage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const sp = await searchParams;
  const { plan } = await getContext();
  if (!hasFeature(plan, "gestao")) redirect("/orcamentos");
  const [products, channels] = await Promise.all([getProducts(), getChannels()]);
  const valid = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
  return (
    <>
      <PageHeader title={(await getT()).ops.quotes.new} description={(await getT()).ops.quotes.newDesc} />
      <Flash erro={sp.erro} />
      <QuoteOrderForm mode="quote" action={saveQuote} products={products} channels={channels} defaultValidUntil={valid} />
    </>
  );
}
