"use client";

import {
  BadgePercent,
  Boxes,
  Calculator,
  ClipboardList,
  FileText,
  CreditCard,
  Gift,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Paperclip,
  Printer,
  Receipt,
  Settings,
  Spool,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useI18n } from "@/i18n/client";

const NAV = [
  { href: "/painel", key: "painel" as const, icon: LayoutDashboard, owner: true },
  { href: "/calculadora", key: "calculadora" as const, icon: Calculator },
  { href: "/orcamentos", key: "orcamentos" as const, icon: FileText },
  { href: "/pedidos", key: "pedidos" as const, icon: ClipboardList },
  { href: "/vendas", key: "vendas" as const, icon: Receipt },
  { href: "/produtos", key: "produtos" as const, icon: Package },
  { href: "/estoque", key: "estoque" as const, icon: Boxes },
  { href: "/impressoras", key: "impressoras" as const, icon: Printer },
  { href: "/materiais", key: "materiais" as const, icon: Spool },
  { href: "/insumos", key: "insumos" as const, icon: Paperclip },
  { href: "/configuracoes", key: "configuracoes" as const, icon: Settings, owner: true },
  { href: "/equipe", key: "equipe" as const, icon: Users },
  { href: "/conteudos", key: "conteudos" as const, icon: Gift, owner: true },
  { href: "/clube", key: "clube" as const, icon: BadgePercent },
  { href: "/plano", key: "plano" as const, icon: CreditCard, owner: true },
];

export function Sidebar({
  userName,
  planLabel,
  signOut,
  role = "dono",
}: {
  userName: string;
  planLabel: string;
  signOut: () => Promise<void>;
  role?: "dono" | "membro";
}) {
  const path = usePathname();
  const { t } = useI18n();
  const tn = t.common.nav;
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-1 flex-col gap-0.5">
      {NAV.filter((n) => role === "dono" || !n.owner).map(({ href, key, icon: Icon }) => {
        const label = tn[key];
        const active = path === href || path.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-semibold transition ${
              active ? "bg-primary-soft text-primary" : "text-ink-2 hover:bg-surface-2"
            }`}
          >
            <Icon size={19} strokeWidth={active ? 2.3 : 1.9} />
            {label}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="mt-4 space-y-1 border-t border-line pt-4">
      <div className="px-3 pb-2">
        <p className="truncate text-sm font-semibold">{userName}</p>
        <p className="text-xs text-muted">{role === "membro" ? tn.teamMember : tn.planLabel(planLabel)}</p>
      </div>
      <ThemeToggle className="w-full" />
      <LanguageSwitcher className="w-full" />
      <form action={signOut}>
        <button className="inline-flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-muted transition hover:bg-surface-2 hover:text-ink">
          <LogOut size={18} /> {tn.signOut}
        </button>
      </form>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col overflow-y-auto border-r border-line bg-surface px-4 py-6 lg:flex">
        <Link href={role === "membro" ? "/pedidos" : "/painel"} className="mb-8 px-2">
          <Logo size={28} />
        </Link>
        {nav}
        {footer}
      </aside>

      {/* Mobile */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-surface/95 px-4 py-3 backdrop-blur lg:hidden">
        <Link href="/painel">
          <Logo size={26} />
        </Link>
        <button onClick={() => setOpen(true)} className="rounded-xl p-2 text-ink-2 hover:bg-surface-2" aria-label={tn.openMenu}>
          <Menu size={24} />
        </button>
      </header>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 right-0 flex w-72 flex-col overflow-y-auto bg-surface px-4 py-5 shadow-xl">
            <div className="mb-6 flex items-center justify-between px-2">
              <Logo size={26} />
              <button onClick={() => setOpen(false)} className="rounded-xl p-2 hover:bg-surface-2" aria-label={tn.closeMenu}>
                <X size={22} />
              </button>
            </div>
            {nav}
            {footer}
          </aside>
        </div>
      )}
    </>
  );
}
