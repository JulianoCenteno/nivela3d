import { notFound } from "next/navigation";
import { DeleteButton } from "@/components/DeleteButton";
import { ProductForm } from "@/components/ProductForm";
import { Flash, PageHeader } from "@/components/ui";
import { getChannels, getMaterials, getPrinters, getProducts, getSettings, getSupplies } from "@/lib/data";
import { deleteProduct } from "../../actions";

export const metadata = { title: "Editar produto" };

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

  return (
    <>
      <PageHeader
        title={product.name}
        description="Altere os dados e o custo é recalculado ao salvar."
        action={<DeleteButton id={product.id} action={deleteProduct} confirmText={`Remover ${product.name}?`} label="Remover produto" />}
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
