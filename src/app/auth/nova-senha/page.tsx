import { AuthShell } from "@/components/AuthShell";
import { SubmitButton } from "@/components/SubmitButton";
import { updatePassword } from "@/app/(auth)/actions";
import { getT } from "@/i18n/server";

export async function generateMetadata() {
  return { title: (await getT()).common.auth.newPassword };
}

export default async function NewPasswordPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const sp = await searchParams;
  const a = (await getT()).common.auth;
  return (
    <AuthShell title={a.newPasswordTitle} error={sp.erro}>
      <form action={updatePassword} className="space-y-4">
        <div>
          <label className="label" htmlFor="password">{a.newPassword}</label>
          <input className="input" id="password" name="password" type="password" minLength={8} required />
        </div>
        <SubmitButton className="btn-primary w-full">{a.savePassword}</SubmitButton>
      </form>
    </AuthShell>
  );
}
