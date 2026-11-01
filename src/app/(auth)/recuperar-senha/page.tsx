import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { SubmitButton } from "@/components/SubmitButton";
import { requestReset } from "../actions";

export const metadata = { title: "Recuperar senha" };

export default function ResetPage() {
  return (
    <AuthShell title="Recuperar senha" subtitle="Enviaremos um link para você criar uma nova senha.">
      <form action={requestReset} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">E-mail</label>
          <input className="input" id="email" name="email" type="email" required />
        </div>
        <SubmitButton className="btn-primary w-full" pendingText="Enviando…">Enviar link</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link href="/login" className="font-semibold text-primary hover:underline">Voltar para o login</Link>
      </p>
    </AuthShell>
  );
}
