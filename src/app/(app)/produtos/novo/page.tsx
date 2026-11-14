import { ProductForm } from "@/components/ProductForm";
import { Flash, PageHeader } from "@/components/ui";
import { getChannels, getMaterials, getPrinters, getProducts, getSettings, getSupplies } from "@/lib/data";
import { getT } from "@/i18n/server";

export async function generateMetadata() {
  return { title: (await getT()).products.list.new };
}

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
      <PageHeader title={(await getT()).products.list.new} description={(await getT()).products.list.newDesc} />
      <Flash erro={sp.erro} />
      <ProductForm printers={printers} materials={materials} channels={channels} settings={settings} supplies={supplies} categories={categories} />
    </>
  );
}
