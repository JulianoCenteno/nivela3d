import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { getContext } from "@/lib/data";
import { planInfo } from "@/lib/plans";
import { signOut } from "../(auth)/actions";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, plan, profile } = await getContext();
  const info = planInfo(plan);
  const name = profile?.name || user.email || "";

  let trialLeft: number | null = null;
  if (plan === "teste" && profile?.created_at) {
    const end = new Date(profile.created_at).getTime() + 7 * 864e5;
    trialLeft = Math.max(0, Math.ceil((end - Date.now()) / 864e5));
  }

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <Sidebar userName={name} planLabel={info?.label ?? "inativo"} signOut={signOut} />
      <div className="min-w-0 flex-1">
        {plan === "nenhum" && (
          <div className="border-b border-line bg-negative-soft px-6 py-3 text-sm font-medium text-negative">
            Sua assinatura não está ativa. Você pode consultar seus dados, mas não cadastrar novos.{" "}
            <Link href="/plano" className="underline">Ver planos</Link>
          </div>
        )}
        {trialLeft !== null && (
          <div className="border-b border-line bg-sand-soft px-6 py-3 text-sm font-medium text-ink-2">
            Teste grátis: {trialLeft === 1 ? "falta 1 dia" : `faltam ${trialLeft} dias`}.{" "}
            <Link href="/plano" className="font-semibold text-primary underline">Assinar agora</Link>
          </div>
        )}
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
