import Link from "next/link";
import { Sidebar } from "@/components/Sidebar";
import { getContext } from "@/lib/data";
import { planInfo } from "@/lib/plans";
import { signOut } from "../(auth)/actions";
import { getI18n } from "@/i18n/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, plan, profile, role } = await getContext();
  const { t } = await getI18n();
  const tb = t.common.banner;
  const info = planInfo(plan);
  const name = profile?.name || user.email || "";

  let trialLeft: number | null = null;
  if (plan === "teste" && profile?.created_at) {
    const end = new Date(profile.created_at).getTime() + 7 * 864e5;
    trialLeft = Math.max(0, Math.ceil((end - Date.now()) / 864e5));
  }

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <Sidebar userName={name} planLabel={info ? t.content.planNames[plan as keyof typeof t.content.planNames] ?? info.label : t.common.nav.inactive} signOut={signOut} role={role} />
      <div className="min-w-0 flex-1">
        {plan === "nenhum" && role === "dono" && (
          <div className="border-b border-line bg-negative-soft px-6 py-3 text-sm font-medium text-negative">
            {tb.inactive}{" "}
            <Link href="/plano" className="underline">{tb.seePlans}</Link>
          </div>
        )}
        {trialLeft !== null && role === "dono" && (
          <div className="border-b border-line bg-sand-soft px-6 py-3 text-sm font-medium text-ink-2">
            {tb.trial(trialLeft)}{" "}
            <Link href="/plano" className="font-semibold text-primary underline">{tb.subscribe}</Link>
          </div>
        )}
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-10">{children}</main>
      </div>
    </div>
  );
}
