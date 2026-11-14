import { notFound } from "next/navigation";
import { QuoteOrderForm } from "@/components/QuoteOrderForm";
import { Flash, PageHeader } from "@/components/ui";
import { getChannels, getContext, getProducts } from "@/lib/data";
import { getOrder, getPeople } from "@/lib/gestao-data";
import { hasFeature } from "@/lib/plans";
import { saveOrder } from "../../../gestao-actions";
import { getT } from "@/i18n/server";

export async function generateMetadata() {
  return { title: (await getT()).ops.orders.title };
}

export default async function EditOrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ erro?: string }> }) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { plan } = await getContext();
  const [order, products, channels, people] = await Promise.all([
    getOrder(id),
    getProducts(),
    getChannels(),
    hasFeature(plan, "equipe") ? getPeople() : Promise.resolve([]),
  ]);
  if (!order) notFound();
  return (
    <>
      <PageHeader title={(await getT()).ops.orders.editN(order.number)} />
      <Flash erro={sp.erro} />
      <QuoteOrderForm mode="order" action={saveOrder} products={products} channels={channels} people={people} order={order} />
    </>
  );
}
