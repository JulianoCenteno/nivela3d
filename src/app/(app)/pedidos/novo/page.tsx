import { redirect } from "next/navigation";
import { QuoteOrderForm } from "@/components/QuoteOrderForm";
import { Flash, PageHeader } from "@/components/ui";
import { getChannels, getContext, getProducts } from "@/lib/data";
import { getPeople, getQuote } from "@/lib/gestao-data";
import type { OrderRow } from "@/lib/orders";
import { hasFeature } from "@/lib/plans";
import { saveOrder } from "../../gestao-actions";

export const metadata = { title: "Novo pedido" };

export default async function NewOrderPage({ searchParams }: { searchParams: Promise<{ erro?: string; orcamento?: string }> }) {
  const sp = await searchParams;
  const { plan } = await getContext();
  if (!hasFeature(plan, "gestao")) redirect("/pedidos");
  const [products, channels, people, quote] = await Promise.all([
    getProducts(),
    getChannels(),
    hasFeature(plan, "equipe") ? getPeople() : Promise.resolve([]),
    sp.orcamento ? getQuote(sp.orcamento) : Promise.resolve(null),
  ]);
  // Pré-preenche a partir de um orçamento (sem id: vira um pedido novo).
  const prefill = quote
    ? ({
        customer_name: quote.customer_name,
        customer_phone: quote.customer_phone,
        items: quote.items,
        discount: quote.discount,
        shipping: quote.shipping,
        shipping_cost: 0,
        channel_id: quote.channel_id,
        due_date: quote.delivery_days != null ? new Date(Date.now() + quote.delivery_days * 864e5).toISOString().slice(0, 10) : null,
        notes: quote.notes,
        assigned_to: null,
      } as unknown as OrderRow)
    : null;
  return (
    <>
      <PageHeader title="Novo pedido" description="Cadastre o pedido com o prazo de entrega. Depois é só ir avançando as etapas." />
      <Flash erro={sp.erro} />
      <QuoteOrderForm mode="order" action={saveOrder} products={products} channels={channels} people={people} order={prefill} />
    </>
  );
}
