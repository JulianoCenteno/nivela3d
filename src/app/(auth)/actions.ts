"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function origin() {
  const h = await headers();
  return process.env.NEXT_PUBLIC_SITE_URL || `${h.get("x-forwarded-proto") ?? "https"}://${h.get("host")}`;
}

const q = (msg: string) => encodeURIComponent(msg);

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email")).trim(),
    password: String(formData.get("password")),
  });
  if (error) {
    const msg = error.message.includes("Email not confirmed")
      ? "Confirme seu e-mail pelo link que enviamos antes de entrar."
      : "E-mail ou senha incorretos.";
    redirect(`/login?erro=${q(msg)}`);
  }
  redirect("/painel");
}

export async function signUp(formData: FormData) {
  const password = String(formData.get("password"));
  if (password.length < 8) redirect(`/cadastro?erro=${q("A senha precisa ter pelo menos 8 caracteres.")}`);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get("email")).trim().toLowerCase(),
    password,
    options: {
      data: { name: String(formData.get("name") ?? "").trim() },
      emailRedirectTo: `${await origin()}/auth/callback?next=/painel`,
    },
  });
  if (error) {
    const msg = error.message.includes("already registered")
      ? "Este e-mail já tem conta. Faça login."
      : "Não foi possível criar a conta. Verifique os dados.";
    redirect(`/cadastro?erro=${q(msg)}`);
  }
  if (!data.session) {
    redirect(`/login?ok=${q("Conta criada! Enviamos um link de confirmação para o seu e-mail.")}`);
  }
  redirect("/painel");
}

export async function requestReset(formData: FormData) {
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(String(formData.get("email")).trim(), {
    redirectTo: `${await origin()}/auth/callback?next=/auth/nova-senha`,
  });
  redirect(`/login?ok=${q("Se o e-mail estiver cadastrado, você receberá um link para criar uma nova senha.")}`);
}

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password"));
  if (password.length < 8) redirect(`/auth/nova-senha?erro=${q("A senha precisa ter pelo menos 8 caracteres.")}`);
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(`/auth/nova-senha?erro=${q("Link expirado. Peça um novo.")}`);
  redirect("/painel");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
