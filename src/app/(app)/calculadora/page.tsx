import Link from "next/link";
import { CostCalculator } from "@/components/CostCalculator";
import { PageHeader } from "@/components/ui";
import { getChannels, getMaterials, getPrinters, getSettings, getSupplies } from "@/lib/data";
import { getT } from "@/i18n/server";

export async function generateMetadata() {
  return { title: (await getT()).common.nav.calculadora };
}

export default async function CalculatorPage() {
  const [printers, materials, channels, settings, supplies] = await Promise.all([
    getPrinters(),
    getMaterials(),
    getChannels(),
    getSettings(),
    getSupplies(),
  ]);
  const c = (await getT()).products.calc;

  return (
    <>
      <PageHeader
        title={c.title}
        description={c.desc}
        action={
          <Link href="/produtos/novo" className="btn-ghost">
            {c.addProduct}
          </Link>
        }
      />
      <CostCalculator printers={printers} materials={materials} channels={channels} settings={settings} supplies={supplies} />
    </>
  );
}
