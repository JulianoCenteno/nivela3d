"use server";

import { calcCost, suggestPrice } from "@/lib/calc";
import { getChannels, getContext, getExpenses, getMaterials, getPrinters, getSales, getSettings } from "@/lib/data";
import { expensesByCategory, goalProgress, summarize } from "@/lib/finance";
import { monthRange, todayISO } from "@/lib/period";
import { getI18n } from "@/i18n/server";
import { LOCALE_TAG } from "@/i18n/config";

export interface NivoReply {
  text: string;
  link?: { href: string; label: string };
  chips?: string[];
}

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const has = (q: string, re: RegExp) => re.test(q);

/** Lê "80g", "80 gramas", "1,5 kg" e "5h", "5 horas", "90 min". */
function parsePiece(q: string) {
  const g = q.match(/(\d+(?:[.,]\d+)?)\s*(kg|quilo|kilo|g\b|gr\b|grs\b|gramas?|grams?|gramos?)/);
  const h = q.match(/(\d+(?:[.,]\d+)?)\s*(h\b|hs\b|hrs?\b|horas?|hours?|min\b|minutos?|minutes?)/);
  const n = (s: string) => Number(s.replace(",", "."));
  let grams = g ? n(g[1]) : NaN;
  if (g && /kg|quilo|kilo/.test(g[2])) grams *= 1000;
  let hours = h ? n(h[1]) : NaN;
  if (h && /min/.test(h[2])) hours /= 60;
  return { grams, hours };
}

export async function askNivo(question: string): Promise<NivoReply> {
  const { t, fmt, locale } = await getI18n();
  const n = t.finance.nivo;
  const q = norm(String(question ?? "").slice(0, 300));
  const period = monthRange(undefined, LOCALE_TAG[locale]);
  const month = period.label;

  // ---- Preço de uma peça
  const piece = parsePiece(q);
  const asksPrice = has(q, /cobr|preco|cuanto|price|charge|valor|vender por|how much for/);
  if (Number.isFinite(piece.grams) && Number.isFinite(piece.hours)) {
    const [settings, printers, materials, channels] = await Promise.all([getSettings(), getPrinters(), getMaterials(), getChannels()]);
    const pr = printers[0];
    const mats = materials.filter((m) => m.price_per_kg > 0);
    const pricePerKg = mats.length ? mats.reduce((a, m) => a + m.price_per_kg, 0) / mats.length : locale === "pt" ? 100 : 20;
    const c = calcCost({
      weightG: piece.grams,
      printHours: piece.hours,
      materialPricePerKg: pricePerKg,
      printerWatts: pr?.power_watts ?? 150,
      energyPricePerKwh: settings.energy_price_kwh,
      printerPrice: pr?.purchase_price ?? (locale === "pt" ? 2500 : 500),
      printerLifetimeHours: pr?.lifetime_hours ?? 5000,
      maintenancePerHour: pr?.maintenance_per_hour ?? 0.15,
      failureRatePct: settings.failure_rate_pct,
      laborMinutes: 15,
      laborPerHour: settings.labor_per_hour,
      extraCosts: 0,
      suppliesCost: 0,
    });
    const ch = channels[0];
    const s = suggestPrice(c.total, settings.default_margin_pct, { feePct: ch?.fee_pct ?? 0, feeFixed: ch?.fee_fixed ?? 0 });
    const m = fmt.money;
    return {
      text:
        n.price(
          fmt.number(piece.grams),
          fmt.number(Math.round(piece.hours * 100) / 100),
          m(c.material),
          m(c.energy),
          m(c.depreciation + c.maintenance),
          m(c.failure),
          m(c.labor),
          m(c.total),
          m(s?.price ?? 0),
          m(s?.profit ?? 0),
          fmt.pct(Math.round(s?.marginPct ?? 0)),
        ) +
        "\n\n" +
        n.priceNote,
      link: { href: "/calculadora", label: n.openCalc },
    };
  }
  if (asksPrice && !has(q, /lucr|profit|ganan/)) return { text: n.priceAsk, link: { href: "/calculadora", label: n.openCalc } };

  // ---- Lucro
  if (has(q, /lucr|ganh|fatur|profit|making|earn|revenue|ganancia|ganando|facture/)) {
    const [sales, expenses] = await Promise.all([getSales(period.from, period.to), getExpenses(period.from, period.to)]);
    if (!sales.length) return { text: n.profitNone(month), link: { href: "/vendas", label: t.finance.dash.newSale } };
    const s = summarize(sales, expenses);
    return { text: n.profit(month, fmt.money(s.revenue), fmt.money(s.netProfit), fmt.money(s.expenses), fmt.pct(Math.round(s.marginPct))), link: { href: "/relatorios", label: t.common.nav.relatorios } };
  }

  // ---- Despesas
  if (has(q, /despes|gast|expense|spent|spend|cost/)) {
    const expenses = await getExpenses(period.from, period.to);
    if (!expenses.length) return { text: n.expensesNone(month), link: { href: "/despesas", label: t.finance.dash.newExpense } };
    const total = expenses.reduce((a, e) => a + e.amount, 0);
    const top = expensesByCategory(expenses)[0];
    return { text: n.expenses(month, fmt.money(total), top ? t.finance.cat[top[0]] : ""), link: { href: "/despesas", label: t.common.nav.despesas } };
  }

  // ---- Meta
  if (has(q, /meta|goal|objetiv|target/)) {
    const settings = await getSettings();
    if (!settings.goal_revenue) return { text: n.goalNone, link: { href: "/metas", label: t.finance.dash.setGoal } };
    const sales = await getSales(period.from, period.to);
    const s = summarize(sales, []);
    const p = goalProgress(s.revenue, settings.goal_revenue, todayISO(), period.from, period.to);
    if (p.left <= 0) return { text: n.goalDone, link: { href: "/metas", label: t.common.nav.metas } };
    return { text: n.goal(fmt.pct(Math.round(p.pct)), fmt.money(p.left), fmt.money(p.perDay), p.daysLeft), link: { href: "/metas", label: t.common.nav.metas } };
  }

  // ---- Estoque
  if (has(q, /estoq|filament|stock|inventar|rolo|spool|acaband|running low/)) {
    const materials = await getMaterials();
    if (!materials.length) return { text: n.stockNone, link: { href: "/materiais", label: t.common.nav.materiais } };
    const low = materials.filter((m) => (m.min_stock_g > 0 && m.stock_g <= m.min_stock_g) || m.stock_g <= 0);
    if (low.length) return { text: n.stockLow(low.map((m) => m.name).join(", ")), link: { href: "/estoque", label: t.common.nav.estoque } };
    const kg = materials.reduce((a, m) => a + Math.max(0, m.stock_g), 0) / 1000;
    return { text: n.stockOk(materials.length, fmt.number(Math.round(kg * 10) / 10)), link: { href: "/estoque", label: t.common.nav.estoque } };
  }

  // ---- Perguntas frequentes
  if (has(q, /taxa|fee|comis|shopee|mercado|etsy|amazon|ebay|elo7|marketplace/)) return { text: n.fees };
  if (has(q, /\bpla\b|petg|\babs\b|\basa\b|tpu|resina|resin/)) return { text: n.material };
  if (has(q, /dica|tip|consejo|lucrar mais|profit more|ganar mas|melhorar/))
    return { text: `${n.tipsTitle}\n${n.tips.map((x) => `• ${x}`).join("\n")}` };
  if (has(q, /registr.*venda|log.*sale|lancar.*venda|nueva venta|new sale/)) return { text: n.howSale, link: { href: "/vendas", label: t.finance.dash.newSale } };
  if (has(q, /lanc|registr|add|agreg/) && has(q, /despes|gast|expense/)) return { text: n.howExpense, link: { href: "/despesas", label: t.finance.dash.newExpense } };
  if (has(q, /produto|product|producto|calculadora|calculator/)) return { text: n.howProduct, link: { href: "/calculadora", label: n.openCalc } };

  await getContext();
  return { text: n.unknown, chips: n.chips };
}
