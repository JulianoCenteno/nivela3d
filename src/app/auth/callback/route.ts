import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getT } from "@/i18n/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/painel";
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/painel";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safeNext, url.origin));
  }
  const msg = (await getT()).common.auth.errInvalidLink;
  return NextResponse.redirect(new URL(`/login?erro=${encodeURIComponent(msg)}`, url.origin));
}
