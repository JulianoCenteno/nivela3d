import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { SubmitButton } from "@/components/SubmitButton";
import { signUp } from "../actions";

export const metadata = { title: "Criar conta" };

export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ erro?: string }> }) {
  const sp = await searchParams;
  return (
    <AuthShell
      title="Criar conta"
      subtitle="Comece a calcular seus preços em poucos minutos."
      error={sp.erro}
    >
      <form action={signUp} className="space-y-4">
        <div>
          <label className="label" htmlFor="name">Seu nome</label>
          <input className="input" id="name" name="name" autoComplete="name" required />
        </div>
        <div>
          <label className="label" htmlFor="email">E-mail</label>
          <input className="input" id="email" name="email" type="email" autoComplete="email" required />
          <p className="hint">Já assinou? Use o mesmo e-mail da compra para liberar seu plano automaticamente.</p>
        </div>
        <div>
          <label className="label" htmlFor="password">Senha</label>
          <input className="input" id="password" name="password" type="password" minLength={8} autoComplete="new-password" required />
          <p className="hint">Mínimo de 8 caracteres.</p>
        </div>
        <SubmitButton className="btn-primary w-full" pendingText="Criando conta…">Criar conta</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Já tem conta? <Link href="/login" className="font-semibold text-primary hover:underline">Entrar</Link>
      </p>
    </AuthShell>
  );
}
