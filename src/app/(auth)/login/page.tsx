import Link from "next/link";
import { AuthShell } from "@/components/AuthShell";
import { SubmitButton } from "@/components/SubmitButton";
import { signIn } from "../actions";

export const metadata = { title: "Entrar" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ erro?: string; ok?: string }>;
}) {
  const sp = await searchParams;
  return (
    <AuthShell title="Entrar" subtitle="Acesse sua conta Nivela 3D." error={sp.erro} ok={sp.ok}>
      <form action={signIn} className="space-y-4">
        <div>
          <label className="label" htmlFor="email">E-mail</label>
          <input className="input" id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label className="label" htmlFor="password">Senha</label>
            <Link href="/recuperar-senha" className="text-sm font-medium text-primary hover:underline">
              Esqueci a senha
            </Link>
          </div>
          <input className="input" id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <SubmitButton className="btn-primary w-full" pendingText="Entrando…">Entrar</SubmitButton>
      </form>
      <p className="mt-6 text-center text-sm text-muted">
        Ainda não tem conta?{" "}
        <Link href="/cadastro" className="font-semibold text-primary hover:underline">Criar conta</Link>
      </p>
    </AuthShell>
  );
}
