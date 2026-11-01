import { ProductForm } from "@/components/ProductForm";
import { Flash, PageHeader } from "@/components/ui";
import { getChannels, getMaterials, getPrinters, getProducts, getSettings, getSupplies } from "@/lib/data";

export const metadata = { title: "Novo produto" };

export default async function NewProductPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const sp = await searchParams;
  const [printers, materials, channels, settings, products, supplies] = await Promise.all([
    getPrinters(),
    getMaterials(),
    getChannels(),
    getSettings(),
    getProducts(),
    getSupplies(),
  ]);
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean) as string[])];
  return (
    <>
      <PageHeader title="Novo produto" description="Cadastre uma vez e use nas vendas — o custo é calculado automaticamente." />
      <Flash erro={sp.erro} />
      <ProductForm printers={printers} materials={materials} channels={channels} settings={settings} supplies={supplies} categories={categories} />
    </>
  );
}
