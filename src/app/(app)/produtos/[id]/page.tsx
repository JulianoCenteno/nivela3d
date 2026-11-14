import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/DeleteButton";
import { ProductForm } from "@/components/ProductForm";
import { Flash, PageHeader } from "@/components/ui";
import { getChannels, getMaterials, getPrinters, getProducts, getSettings, getSupplies } from "@/lib/data";
import { deleteProduct } from "../../actions";
import { getT } from "@/i18n/server";

export async function generateMetadata() {
  return { title: (await getT()).products.list.editMeta };
}

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [printers, materials, channels, settings, products, supplies] = await Promise.all([
    getPrinters(),
    getMaterials(),
    getChannels(),
    getSettings(),
    getProducts(),
    getSupplies(),
  ]);
  const product = products.find((p) => p.id === id);
  if (!product) notFound();
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean) as string[])];
  const t = await getT();

  return (
    <>
      <PageHeader
        title={product.name}
        description={t.products.list.editDesc}
        action={<DeleteButton id={product.id} action={deleteProduct} confirmText={t.catalog.removeName(product.name)} label={t.products.list.removeProduct} />}
      />
      <Flash erro={sp.erro} />
      <ProductForm
        product={product}
        printers={printers}
        materials={materials}
        channels={channels}
        settings={settings}
        supplies={supplies}
        categories={categories}
      />
    </>
  );
}
