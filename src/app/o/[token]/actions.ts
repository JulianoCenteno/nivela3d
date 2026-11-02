"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/** Cliente aprova o orçamento pelo link (vira pedido no banco, de forma atômica). */
export async function approveQuote(fd: FormData) {
  const token = String(fd.get("token") ?? "");
  if (token.length < 20) redirect("/");
  const supabase = await createClient();
  const { data } = await supabase.rpc("approve_public_quote", { p_token: token });
  redirect(`/o/${token}?r=${encodeURIComponent(String(data ?? "erro"))}`);
}
