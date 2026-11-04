import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { BONUSES } from "@/lib/bonus";
import { createClient } from "@/lib/supabase/server";

/** Entrega dos bônus da assinatura: só para quem está logado com plano ativo. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const bonus = BONUSES.find((b) => b.slug === slug);
  if (!bonus) return NextResponse.json({ error: "not found" }, { status: 404 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", req.url));

  const { data: plan } = await supabase.rpc("my_plan");
  if (!plan || plan === "nenhum") {
    return NextResponse.redirect(new URL(`/conteudos?erro=${encodeURIComponent("Os bônus ficam liberados enquanto a assinatura estiver ativa.")}`, req.url));
  }

  const file = await readFile(path.join(process.cwd(), "private", "materiais", path.basename(bonus.file)));
  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${path.basename(bonus.file)}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
