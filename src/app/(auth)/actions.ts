"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getI18n } from "@/i18n/server";

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
    const a = (await getI18n()).t.common.auth;
    const msg = error.message.includes("Email not confirmed") ? a.errNotConfirmed : a.errWrong;
    redirect(`/login?erro=${q(msg)}`);
  }
  redirect("/painel");
}

export async function signUp(formData: FormData) {
  const { t, locale } = await getI18n();
  const a = t.common.auth;
  const password = String(formData.get("password"));
  if (password.length < 8) redirect(`/cadastro?erro=${q(a.errShort)}`);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: String(formData.get("email")).trim().toLowerCase(),
    password,
    options: {
      data: { name: String(formData.get("name") ?? "").trim(), locale },
      emailRedirectTo: `${await origin()}/auth/callback?next=/painel`,
    },
  });
  if (error) {
    const msg = error.message.includes("already registered") ? a.errExists : a.errCreate;
    redirect(`/cadastro?erro=${q(msg)}`);
  }
  if (!data.session) {
    redirect(`/login?ok=${q(a.okCreated)}`);
  }
  redirect("/painel");
}

export async function requestReset(formData: FormData) {
  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(String(formData.get("email")).trim(), {
    redirectTo: `${await origin()}/auth/callback?next=/auth/nova-senha`,
  });
  redirect(`/login?ok=${q((await getI18n()).t.common.auth.okReset)}`);
}

export async function updatePassword(formData: FormData) {
  const a = (await getI18n()).t.common.auth;
  const password = String(formData.get("password"));
  if (password.length < 8) redirect(`/auth/nova-senha?erro=${q(a.errShort)}`);
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect(`/auth/nova-senha?erro=${q(a.errExpired)}`);
  redirect("/painel");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
