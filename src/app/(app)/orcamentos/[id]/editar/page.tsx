import { notFound } from "next/navigation";
import { QuoteOrderForm } from "@/components/QuoteOrderForm";
import { Flash, PageHeader } from "@/components/ui";
import { getChannels, getProducts } from "@/lib/data";
import { getQuote } from "@/lib/gestao-data";
import { saveQuote } from "../../../gestao-actions";
import { getT } from "@/i18n/server";

export async function generateMetadata() {
  return { title: (await getT()).ops.quotes.title };
}

export default async function EditQuotePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erro?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [quote, products, channels] = await Promise.all([getQuote(id), getProducts(), getChannels()]);
  if (!quote) notFound();
  return (
    <>
      <PageHeader title={(await getT()).ops.quotes.editN(quote.number)} />
      <Flash erro={sp.erro} />
      <QuoteOrderForm mode="quote" action={saveQuote} products={products} channels={channels} quote={quote} />
    </>
  );
}
