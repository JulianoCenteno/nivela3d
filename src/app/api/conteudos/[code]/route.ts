import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { EXTRAS } from "@/lib/extras";
import { createClient } from "@/lib/supabase/server";

/**
 * Entrega protegida dos conteúdos extras.
 * GET /api/conteudos/bump_mensagens?item=0
 * Só funciona para quem está logado e tem a compra ativa no próprio e-mail.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const extra = EXTRAS.find((e) => e.code === code);
  if (!extra) return NextResponse.json({ error: "not found" }, { status: 404 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  // RLS garante que só aparecem compras do e-mail do próprio usuário.
  const { data: owned } = await supabase.from("purchases").select("product").eq("product", code).eq("status", "active").maybeSingle();
  if (!owned) return NextResponse.redirect(new URL(`/conteudos?erro=${encodeURIComponent("Esse conteúdo ainda não foi liberado na sua conta.")}`, req.url));

  const idx = Math.max(0, Number(req.nextUrl.searchParams.get("item") ?? 0) || 0);
  const item = extra.items[idx];
  if (!item) return NextResponse.json({ error: "not found" }, { status: 404 });

  if (item.canvaEnv) {
    const link = process.env[item.canvaEnv];
    if (!link) return NextResponse.redirect(new URL(`/conteudos?erro=${encodeURIComponent("Link em preparação. Tente novamente em breve.")}`, req.url));
    return NextResponse.redirect(link);
  }

  if (item.file) {
    const file = await readFile(path.join(process.cwd(), "private", "materiais", path.basename(item.file)));
    return new NextResponse(new Uint8Array(file), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${path.basename(item.file)}"`,
        "Cache-Control": "private, no-store",
      },
    });
  }
  return NextResponse.json({ error: "not found" }, { status: 404 });
}
