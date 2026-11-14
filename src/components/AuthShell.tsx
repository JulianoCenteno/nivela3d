import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { getT } from "@/i18n/server";

export async function AuthShell({
  title,
  subtitle,
  error,
  ok,
  children,
}: {
  title: string;
  subtitle?: string;
  error?: string;
  ok?: string;
  children: React.ReactNode;
}) {
  const t = await getT();
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-[#182B30] p-12 text-[#F5F3EE] lg:flex lg:flex-col">
        <div className="dark">
          <Logo size={34} />
        </div>
        <div className="mt-auto max-w-md">
          <p className="text-4xl font-extrabold leading-tight tracking-tight">
            {t.common.auth.tagline1}
            <br />
            <span className="text-[#8FA69A]">{t.common.auth.tagline2}</span>
          </p>
          <p className="mt-5 text-lg leading-relaxed text-[#F5F3EE]/75">
            {t.common.auth.pitch}
          </p>
        </div>
        <svg className="pointer-events-none absolute -right-24 top-24 opacity-[0.07]" width="520" height="520" viewBox="0 0 48 48" fill="none">
          <path d="M24 5 43 14.5 24 24 5 14.5 24 5Z" fill="#F5F3EE" />
          <path d="M6 22.5 24 31.5l18-9" stroke="#F5F3EE" strokeWidth="4.2" strokeLinecap="round" />
          <path d="M6 30.5 24 39.5l18-9" stroke="#F5F3EE" strokeWidth="4.2" strokeLinecap="round" />
        </svg>
      </aside>

      <main className="flex flex-col px-6 py-8 sm:px-10">
        <div className="flex items-center justify-between">
          <span className="lg:invisible">
            <Logo size={28} />
          </span>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <div className="mx-auto my-auto w-full max-w-sm py-10">
          <h1 className="text-[1.75rem] font-extrabold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-2 text-muted">{subtitle}</p>}
          {error && (
            <p className="mt-5 rounded-xl bg-negative-soft px-4 py-3 text-sm font-medium text-negative">{error}</p>
          )}
          {ok && (
            <p className="mt-5 rounded-xl bg-primary-soft px-4 py-3 text-sm font-medium text-primary">{ok}</p>
          )}
          <div className="mt-7">{children}</div>
        </div>
      </main>
    </div>
  );
}
