import Link from "next/link";
import { CostCalculator } from "@/components/CostCalculator";
import { PageHeader } from "@/components/ui";
import { getChannels, getMaterials, getPrinters, getSettings, getSupplies } from "@/lib/data";

export const metadata = { title: "Calculadora" };

export default async function CalculatorPage() {
  const [printers, materials, channels, settings, supplies] = await Promise.all([
    getPrinters(),
    getMaterials(),
    getChannels(),
    getSettings(),
    getSupplies(),
  ]);

  return (
    <>
      <PageHeader
        title="Calculadora de preço"
        description="Descubra quanto custa cada peça e por quanto vender para ter lucro de verdade."
        action={
          <Link href="/produtos/novo" className="btn-ghost">
            Cadastrar produto
          </Link>
        }
      />
      <CostCalculator printers={printers} materials={materials} channels={channels} settings={settings} supplies={supplies} />
    </>
  );
}
