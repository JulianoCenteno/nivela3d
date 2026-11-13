import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { addCycle, LIFETIME_END, parseEvent } from "@/lib/webhook";

/**
 * Webhook da plataforma de vendas (Digital Hub).
 * URL a cadastrar em Integrações → Webhook:
 *   https://SEU-DOMINIO/api/webhooks/digitalhub?token=SEU_TOKEN
 *
 * O token é conferido pelo próprio banco (funções wh_*), então o app não
 * precisa da chave secreta (service role) do Supabase.
 */
export async function POST(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token") ?? req.headers.get("x-webhook-token") ?? "";
  if (!token) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  let map: Record<string, string> = {};
  try {
    map = JSON.parse(process.env.PLAN_PRODUCT_MAP || "{}");
  } catch {}

  const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  const log = async (result: string) => {
    const { error } = await db.rpc("wh_log", { p_token: token, p_payload: payload, p_result: result });
    return error;
  };

  // Valida o token logo no primeiro acesso ao banco.
  const ev = parseEvent(payload, map);
  if (!ev || !ev.status) {
    const err = await log(!ev ? "ignorado: sem e-mail" : "ignorado: evento sem efeito (pendente/recusado/desconhecido)");
    if (err) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    return NextResponse.json({ ok: true, ignored: true });
  }

  const results: string[] = [];

  // ----- Order bumps / conteúdos extras -----
  if (ev.extras.length) {
    const status = ev.status === "active" ? "active" : ev.status === "refunded" || ev.status === "canceled" ? "refunded" : null;
    if (status) {
      const { error } = await db.rpc("wh_purchases", {
        p_token: token, p_email: ev.email, p_products: ev.extras, p_status: status, p_external_id: ev.externalId,
      });
      if (error?.code === "28000") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      results.push(error ? `extras erro: ${error.message}` : `extras ${status}: ${ev.extras.join(",")}`);
    }
  }

  // ----- Assinatura -----
  let plan = ev.plan;
  if (!plan && !ev.extras.length) {
    const { data, error } = await db.rpc("wh_current_plan", { p_token: token, p_email: ev.email });
    if (error?.code === "28000") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    plan = (data as typeof plan) ?? null;
  }

  if (plan) {
    // Vitalício: acesso até 2099; eventos de cancelamento de recorrência não tiram o acesso.
    if (ev.lifetime && ev.status === "canceled") {
      await log(`ignorado: cancelamento em compra vitalícia (${ev.email})`);
      return NextResponse.json({ ok: true, ignored: true });
    }
    const periodEnd =
      ev.status === "active"
        ? ev.lifetime
          ? LIFETIME_END
          : ev.periodEnd ?? addCycle(new Date(), ev.cycle).toISOString()
        : ev.status === "refunded"
          ? new Date().toISOString()
          : ev.periodEnd;
    const { error } = await db.rpc("wh_subscription", {
      p_token: token, p_email: ev.email, p_plan: plan, p_status: ev.status, p_cycle: ev.lifetime ? "anual" : ev.cycle,
      p_period_end: periodEnd, p_external_id: ev.externalId,
    });
    if (error?.code === "28000") return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    results.push(error ? `plano erro: ${error.message}` : `plano ${plan}${ev.lifetime ? " vitalício" : ""} (${ev.status})`);
  }

  const err = await log(results.length ? `ok: ${ev.email} → ${results.join(" | ")}` : "ignorado: plano não identificado");
  if (err && !results.length) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ ok: true, results });
}
