import type { Locale } from "@/i18n/config";

export type PlanId = "teste" | "iniciante" | "profissional" | "empresa" | "nenhum";

export interface PlanInfo {
  id: PlanId;
  label: string;
  price: string;
  printers: number;
  products: number;
  features: string[];
}

/** Limite tratado como "ilimitado" (espelha public.plan_limit no banco). */
export const UNLIMITED = 100000;

export const PLANS: Record<Exclude<PlanId, "nenhum">, PlanInfo> = {
  teste: {
    id: "teste",
    label: "Teste grátis",
    price: "7 dias",
    printers: 1,
    products: 30,
    features: ["Calculadora completa", "1 impressora", "30 produtos", "Registro de vendas"],
  },
  iniciante: {
    id: "iniciante",
    label: "Iniciante",
    price: "R$ 19,90/mês",
    printers: 1,
    products: 30,
    features: ["Calculadora completa", "1 impressora", "30 produtos", "Custos e relatórios básicos"],
  },
  profissional: {
    id: "profissional",
    label: "Profissional",
    price: "R$ 39,90/mês",
    printers: UNLIMITED,
    products: UNLIMITED,
    features: [
      "Tudo do Iniciante",
      "Impressoras ilimitadas",
      "Produtos ilimitados",
      "Orçamentos, pedidos e estoque",
      "Relatórios completos",
    ],
  },
  empresa: {
    id: "empresa",
    label: "Empresa",
    price: "R$ 79,90/mês",
    printers: UNLIMITED,
    products: UNLIMITED,
    features: [
      "Tudo do Profissional",
      "Equipe com até 5 pessoas",
      "Automações: link de orçamento, baixa de estoque e alertas de prazo",
      "Suporte prioritário",
    ],
  },
};

export type PaidPlan = "iniciante" | "profissional" | "empresa";
export type BillingCycle = "mensal" | "trimestral" | "anual";

export const CYCLES: { id: BillingCycle; label: string; badge?: string; badgeShort?: string }[] = [
  { id: "mensal", label: "Mensal" },
  { id: "trimestral", label: "Trimestral", badge: "-8%" },
  { id: "anual", label: "Anual", badge: "2 meses grátis", badgeShort: "-17%" },
];

/** Preço por ciclo: `perMonth` é o equivalente mensal exibido em destaque; `total` é o valor cobrado no ciclo. */
export const CYCLE_PRICES: Record<PaidPlan, Record<BillingCycle, { perMonth: string; total: string }>> = {
  iniciante: {
    mensal: { perMonth: "19,90", total: "R$ 19,90" },
    trimestral: { perMonth: "18,30", total: "R$ 54,90" },
    anual: { perMonth: "16,58", total: "R$ 199" },
  },
  profissional: {
    mensal: { perMonth: "39,90", total: "R$ 39,90" },
    trimestral: { perMonth: "36,63", total: "R$ 109,90" },
    anual: { perMonth: "33,25", total: "R$ 399" },
  },
  empresa: {
    mensal: { perMonth: "79,90", total: "R$ 79,90" },
    trimestral: { perMonth: "73,30", total: "R$ 219,90" },
    anual: { perMonth: "66,58", total: "R$ 799" },
  },
};

export function cycleNote(plan: PaidPlan, cycle: BillingCycle): string {
  const { total } = CYCLE_PRICES[plan][cycle];
  if (cycle === "trimestral") return `${total} a cada 3 meses`;
  if (cycle === "anual") return `${total} por ano`;
  return "";
}

/**
 * Links de checkout na plataforma — configure no .env / Vercel.
 * (Referências estáticas: o Next só embute variáveis NEXT_PUBLIC escritas por extenso.)
 */
export const CHECKOUT_BY_CYCLE: Record<PaidPlan, Record<BillingCycle, string | undefined>> = {
  iniciante: {
    mensal: process.env.NEXT_PUBLIC_CHECKOUT_INICIANTE,
    trimestral: process.env.NEXT_PUBLIC_CHECKOUT_INICIANTE_TRIMESTRAL,
    anual: process.env.NEXT_PUBLIC_CHECKOUT_INICIANTE_ANUAL,
  },
  profissional: {
    mensal: process.env.NEXT_PUBLIC_CHECKOUT_PROFISSIONAL,
    trimestral: process.env.NEXT_PUBLIC_CHECKOUT_PROFISSIONAL_TRIMESTRAL,
    anual: process.env.NEXT_PUBLIC_CHECKOUT_PROFISSIONAL_ANUAL,
  },
  empresa: {
    mensal: process.env.NEXT_PUBLIC_CHECKOUT_EMPRESA,
    trimestral: process.env.NEXT_PUBLIC_CHECKOUT_EMPRESA_TRIMESTRAL,
    anual: process.env.NEXT_PUBLIC_CHECKOUT_EMPRESA_ANUAL,
  },
};

/** Mantido por compatibilidade: links do plano mensal. */
export const CHECKOUT_LINKS: Record<PaidPlan, string | undefined> = {
  iniciante: CHECKOUT_BY_CYCLE.iniciante.mensal,
  profissional: CHECKOUT_BY_CYCLE.profissional.mensal,
  empresa: CHECKOUT_BY_CYCLE.empresa.mensal,
};

/** Ciclos com link configurado nos três planos (o mensal sempre aparece). */
export function availableCycles(): BillingCycle[] {
  const plans: PaidPlan[] = ["iniciante", "profissional", "empresa"];
  return CYCLES.map((c) => c.id).filter((c) => c === "mensal" || plans.every((p) => !!CHECKOUT_BY_CYCLE[p][c]));
}

/**
 * Oferta de pagamento único com acesso vitalício (frente low ticket), por idioma.
 * Básico = plano Iniciante; Completo = plano Profissional.
 * O pop-up do Básico oferece o Completo com desconto (link "upgrade").
 * pt cobra em reais; en e es cobram em dólar (checkout da Digital Hub em inglês/espanhol).
 */
type LifetimeOffer = { basico: { price: string; href?: string }; completo: { price: string; href?: string }; upgrade: { price: string; href?: string }; currency: string; symbol: string };

const LIFETIME_BY_LOCALE: Record<Locale, LifetimeOffer> = {
  pt: {
    basico: { price: "19,90", href: process.env.NEXT_PUBLIC_CHECKOUT_VITALICIO_BASICO },
    completo: { price: "59,90", href: process.env.NEXT_PUBLIC_CHECKOUT_VITALICIO_COMPLETO },
    upgrade: { price: "29,90", href: process.env.NEXT_PUBLIC_CHECKOUT_VITALICIO_UPGRADE },
    currency: "BRL",
    symbol: "R$",
  },
  en: {
    basico: { price: "9.90", href: process.env.NEXT_PUBLIC_CHECKOUT_VITALICIO_BASICO_EN },
    completo: { price: "27.00", href: process.env.NEXT_PUBLIC_CHECKOUT_VITALICIO_COMPLETO_EN },
    upgrade: { price: "14.70", href: process.env.NEXT_PUBLIC_CHECKOUT_VITALICIO_UPGRADE_EN },
    currency: "USD",
    symbol: "$",
  },
  es: {
    basico: { price: "9.90", href: process.env.NEXT_PUBLIC_CHECKOUT_VITALICIO_BASICO_ES },
    completo: { price: "27.00", href: process.env.NEXT_PUBLIC_CHECKOUT_VITALICIO_COMPLETO_ES },
    upgrade: { price: "14.70", href: process.env.NEXT_PUBLIC_CHECKOUT_VITALICIO_UPGRADE_ES },
    currency: "USD",
    symbol: "US$",
  },
};

export const lifetimeFor = (l: Locale) => LIFETIME_BY_LOCALE[l];
/** Compatibilidade: oferta em português. */
export const LIFETIME = LIFETIME_BY_LOCALE.pt;

/** A página de vendas usa a oferta vitalícia quando os links do Básico e do Completo existem. */
export function lifetimeEnabled(l: Locale = "pt"): boolean {
  const o = LIFETIME_BY_LOCALE[l];
  return !!o.basico.href && !!o.completo.href;
}

export function planInfo(id: string | null | undefined): PlanInfo | null {
  if (!id || id === "nenhum") return null;
  return PLANS[id as keyof typeof PLANS] ?? null;
}

export type Feature = "gestao" | "automacoes" | "equipe";

/** O que cada plano libera (espelha public.plan_has no banco). */
export function hasFeature(plan: PlanId, f: Feature): boolean {
  if (f === "gestao") return plan === "teste" || plan === "profissional" || plan === "empresa";
  return plan === "empresa";
}
