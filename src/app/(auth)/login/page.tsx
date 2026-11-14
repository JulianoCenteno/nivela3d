import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { SubmitButton } from "@/components/SubmitButton";
import { getT } from "@/i18n/server";
import { signIn } from "../actions";

export async function generateMetadata() {
  return { title: (await getT()).common.auth.signInTitle };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; ok?: string }>;
}) {
  const sp = await searchParams;
  const a = (await getT()).common.auth;
  return (
    <AuthShell title={a.signInTitle} subtitle={a.signInSubtitle} error={sp.erro} ok={sp.ok}>
      <form action={signIn} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">{a.email}</label>
          <input className="input" id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label className="label" htmlFor="password">{a.password}</label>
            <Link href="/recuperar-senha" className="text-sm font-medium text-primary hover:underline">
              {a.forgot}
            </Link>
          </div>
          <input className="input" id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <SubmitButton className="btn-primary w-full" pendingText={a.signingIn}>{a.signInTitle}</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        {a.noAccount}{" "}
        <Link href="/cadastro" className="font-semibold text-primary hover:underline">{a.createAccount}</Link>
      </p>
    </AuthShell>
  );
}
