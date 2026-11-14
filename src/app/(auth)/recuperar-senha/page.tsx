import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { SubmitButton } from "@/components/SubmitButton";
import { getT } from "@/i18n/server";
import { requestReset } from "../actions";

export async function generateMetadata() {
  return { title: (await getT()).common.auth.resetTitle };
}

export default async function ResetPage() {
  const a = (await getT()).common.auth;
  return (
    <AuthShell title={a.resetTitle} subtitle={a.resetSubtitle}>
      <form action={requestReset} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">{a.email}</label>
          <input className="input" id="email" name="email" type="email" required />
        </div>
        <SubmitButton className="btn-primary w-full" pendingText={a.sending}>{a.sendLink}</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="font-semibold text-primary hover:underline">{a.backToLogin}</Link>
      </p>
    </AuthShell>
  );
}
