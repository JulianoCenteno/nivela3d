export type PlanId = "teste" | "iniciante" | "profissional" | "empresa" | "nenhum";

export interface PlanInfo {
  id: PlanId;
  label: string;
  price: string;
  printers: number;
  products: number;
  features: string[];
}

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
    printers: 5,
    products: 200,
    features: [
      "Tudo do Iniciante",
      "Até 5 impressoras",
      "200 produtos",
      "Orçamentos, pedidos e estoque",
      "Relatórios completos",
    ],
  },
  empresa: {
    id: "empresa",
    label: "Empresa",
    price: "R$ 79,90/mês",
    printers: 15,
    products: 5000,
    features: [
      "Tudo do Profissional",
      "Até 15 impressoras",
      "Produtos ilimitados",
      "Equipe com até 5 pessoas",
      "Automações: link de orçamento, baixa de estoque e alertas de prazo",
      "Suporte prioritário",
    ],
  },
};

/** Links de checkout na plataforma — configure no .env. */
export const CHECKOUT_LINKS: Record<"iniciante" | "profissional" | "empresa", string | undefined> = {
  iniciante: process.env.NEXT_PUBLIC_CHECKOUT_INICIANTE,
  profissional: process.env.NEXT_PUBLIC_CHECKOUT_PROFISSIONAL,
  empresa: process.env.NEXT_PUBLIC_CHECKOUT_EMPRESA,
};

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
