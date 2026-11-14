import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";
import { getT } from "@/i18n/server";

export function Badge({ tone, children }: { tone: string; children: React.ReactNode }) {
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${tone}`}>{children}</span>;
}

/** Página inteira bloqueada pelo plano. */
export async function UpgradeCard({ plan, title, text, bullets }: { plan: "Profissional" | "Empresa"; title: string; text: string; bullets: string[] }) {
  const t = await getT();
  const name = plan === "Empresa" ? t.ops.plan.business : t.ops.plan.pro;
  return (
    <div className="card mx-auto max-w-xl p-8 text-center">
      <div className="mx-auto mb-4 w-fit rounded-2xl bg-sand-soft p-4 text-ink-2">
        <Lock size={26} />
      </div>
      <p className="text-sm font-bold uppercase tracking-wider text-sage">{t.ops.upgrade.planTag(name)}</p>
      <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{title}</h2>
      <p className="mt-2 text-muted">{text}</p>
      <ul className="mx-auto mt-5 max-w-sm space-y-2 text-left">
        {bullets.map((b) => (
          <li key={b} className="flex gap-2 text-[15px]">
            <Sparkles size={17} className="mt-0.5 shrink-0 text-sage" /> {b}
          </li>
        ))}
      </ul>
      <Link href="/plano" className="btn-primary mt-7">
        {t.ops.upgrade.see(name)}
      </Link>
    </div>
  );
}

/** Aviso pequeno dentro de uma tela: automação disponível no Empresa. */
export async function EmpresaHint({ children }: { children: React.ReactNode }) {
  const t = await getT();
  return (
    <p className="flex items-start gap-2 rounded-xl bg-sand-soft px-3.5 py-2.5 text-sm text-ink-2">
      <Sparkles size={16} className="mt-0.5 shrink-0 text-sage" />
      <span>
        {children}{" "}
        <Link href="/plano" className="font-semibold text-primary underline">
          {t.ops.upgrade.businessLink}
        </Link>
      </span>
    </p>
  );
}
