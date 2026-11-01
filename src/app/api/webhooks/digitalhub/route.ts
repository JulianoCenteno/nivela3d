import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { addCycle, parseEvent } from "@/lib/webhook";

/**
 * Webhook de assinaturas.
 * URL para cadastrar na plataforma:
 *   https://SEU-DOMINIO/api/webhooks/digitalhub?token=SEU_TOKEN
 * (ou envie o token no header "x-webhook-token").
 */
export async function POST(req: NextRequest) {
  const expected = process.env.DIGITALHUB_WEBHOOK_TOKEN ?? "";
  const got = req.nextUrl.searchParams.get("token") ?? req.headers.get("x-webhook-token") ?? "";
  if (!expected || got.length !== expected.length || !timingSafeEqual(Buffer.from(got), Buffer.from(expected))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

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

  const db = createServiceClient();
  const ev = parseEvent(payload, map);
  const log = (result: string) => db.from("webhook_events").insert({ source: "digitalhub", payload, result });

  if (!ev) {
    await log("ignorado: sem e-mail");
    return NextResponse.json({ ok: true, ignored: "no email" });
  }
  if (!ev.status) {
    await log("ignorado: status desconhecido");
    return NextResponse.json({ ok: true, ignored: "unknown status" });
  }

  const { data: existing } = await db.from("subscriptions").select("plan").eq("email", ev.email).maybeSingle();
  const plan = ev.plan ?? existing?.plan;
  if (!plan) {
    await log("ignorado: plano não identificado");
    return NextResponse.json({ ok: true, ignored: "unknown plan" });
  }

  const periodEnd =
    ev.status === "active" ? ev.periodEnd ?? addCycle(new Date(), ev.cycle).toISOString() : ev.status === "refunded" ? new Date().toISOString() : ev.periodEnd;

  const row: Record<string, unknown> = {
    email: ev.email,
    plan,
    status: ev.status,
    billing_cycle: ev.cycle,
    external_id: ev.externalId,
    updated_at: new Date().toISOString(),
  };
  if (periodEnd) row.current_period_end = periodEnd;

  const { error } = await db.from("subscriptions").upsert(row, { onConflict: "email" });
  await log(error ? `erro: ${error.message}` : `ok: ${ev.email} → ${plan} (${ev.status})`);
  if (error) return NextResponse.json({ error: "db" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
