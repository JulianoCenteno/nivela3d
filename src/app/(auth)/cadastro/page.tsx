import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { SubmitButton } from "@/components/SubmitButton";
import { getT } from "@/i18n/server";
import { signUp } from "../actions";

export async function generateMetadata() {
  return { title: (await getT()).common.auth.createAccount };
}

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const sp = await searchParams;
  const a = (await getT()).common.auth;
  return (
    <AuthShell title={a.createAccount} subtitle={a.signUpSubtitle} error={sp.erro}>
      <form action={signUp} className="space-y-4">
        <div>
          <label className="label" htmlFor="name">{a.yourName}</label>
          <input className="input" id="name" name="name" autoComplete="name" required />
        </div>
        <div>
          <label className="label" htmlFor="email">{a.email}</label>
          <input className="input" id="email" name="email" type="email" autoComplete="email" required />
          <p className="hint">{a.sameEmailHint}</p>
        </div>
        <div>
          <label className="label" htmlFor="password">{a.password}</label>
          <input className="input" id="password" name="password" type="password" minLength={8} autoComplete="new-password" required />
          <p className="hint">{a.minChars}</p>
        </div>
        <SubmitButton className="btn-primary w-full" pendingText={a.creating}>{a.createAccount}</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        {a.haveAccount} <Link href="/login" className="font-semibold text-primary hover:underline">{a.signInTitle}</Link>
      </p>
    </AuthShell>
  );
}
