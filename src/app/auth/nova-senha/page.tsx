import { AuthShell } from "@/components/AuthShell";
import { SubmitButton } from "@/components/SubmitButton";
import { updatePassword } from "@/app/(auth)/actions";

export const metadata = { title: "Nova senha" };

export default async function NewPasswordPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const sp = await searchParams;
  return (
    <AuthShell title="Criar nova senha" error={sp.erro}>
      <form action={updatePassword} className="space-y-4">
        <div>
          <label className="label" htmlFor="password">Nova senha</label>
          <input className="input" id="password" name="password" type="password" minLength={8} required />
        </div>
        <SubmitButton className="btn-primary w-full">Salvar senha</SubmitButton>
      </form>
    </AuthShell>
  );
}
