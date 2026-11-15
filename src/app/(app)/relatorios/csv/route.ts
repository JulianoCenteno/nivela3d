import { NextResponse } from "next/server";
import { getContext } from "@/lib/data";
import { buildReport } from "@/lib/reports";
import { getI18n } from "@/i18n/server";
import { LOCALE_TAG } from "@/i18n/config";

/** Resumo mensal em CSV (abre no Excel e no Google Planilhas). */
export async function GET(req: Request) {
  const { role } = await getContext();
  if (role !== "dono") return new NextResponse("Forbidden", { status: 403 });
  const ym = new URL(req.url).searchParams.get("mes") ?? "";
  const { t, locale } = await getI18n();
  const r_ = t.finance.reports;
  const { period, monthly, products } = await buildReport(ym, LOCALE_TAG[locale], 12);
  const sep = locale === "en" ? "," : ";";
  const num = (v: number) => {
    const s = (Math.round(v * 100) / 100).toFixed(2);
    return locale === "en" ? s : s.replace(".", ",");
  };
  const esc = (s: string) => (/[";,\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s);
  const lines = [
    [r_.month, r_.revenue, r_.cost, r_.fees, r_.expenses, r_.net, r_.margin, r_.orders].map(esc).join(sep),
    ...monthly.map(({ label, s }) =>
      [esc(label), num(s.revenue), num(s.cost), num(s.fees), num(s.expenses), num(s.netProfit), num(s.marginPct), String(s.orders)].join(sep),
    ),
    "",
    esc(r_.products(period.label)),
    [r_.product, r_.qty, r_.revenue, r_.gross].map(esc).join(sep),
    ...products.map((p) => [esc(p.name), String(p.qty), num(p.revenue), num(p.profit)].join(sep)),
  ];
  return new NextResponse("﻿" + lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="nivela3d-${period.ym}.csv"`,
    },
  });
}
