/**
 * Conteúdos extras vendidos à parte (order bumps).
 * - Arquivos PDF ficam em /private/materiais (fora de /public) e só são
 *   entregues pela rota /api/conteudos/[code] para quem comprou.
 * - Links de modelo do Canva ficam em variáveis de ambiente do servidor,
 *   para não aparecerem para quem não comprou.
 */
export type ExtraCode = "bump_mockups" | "bump_etiquetas" | "bump_mensagens" | "bump_guia";

export interface ExtraItem {
  /** Rótulo do item dentro do extra (ex.: "Posts — parte 1"). */
  label: string;
  /** PDF dentro de /private/materiais */
  file?: string;
  /** Variável de ambiente com o link de modelo do Canva */
  canvaEnv?: string;
}

export interface Extra {
  code: ExtraCode;
  title: string;
  description: string;
  price: string;
  format: string;
  checkoutEnv: string;
  items: ExtraItem[];
}

export const EXTRAS: Extra[] = [
  {
    code: "bump_mockups",
    title: "Kit 30 Mockups Editáveis",
    description: "Posts e Stories prontos para divulgar suas peças no Instagram. É só trocar a foto, o nome e o preço.",
    price: "R$ 17,90",
    format: "Modelos do Canva",
    checkoutEnv: "NEXT_PUBLIC_CHECKOUT_BUMP_MOCKUPS",
    items: [
      { label: "Posts para o feed — parte 1 (10 modelos)", canvaEnv: "CANVA_MOCKUPS_1" },
      { label: "Posts para o feed — parte 2 (11 modelos)", canvaEnv: "CANVA_MOCKUPS_2" },
      { label: "Stories (9 modelos)", canvaEnv: "CANVA_MOCKUPS_STORIES" },
    ],
  },
  {
    code: "bump_etiquetas",
    title: "Pack de Etiquetas e Embalagens",
    description: "Etiquetas de produto, cartão de agradecimento, tag de cuidados, adesivos e etiqueta de envio para imprimir.",
    price: "R$ 9,90",
    format: "Modelo do Canva (A4)",
    checkoutEnv: "NEXT_PUBLIC_CHECKOUT_BUMP_ETIQUETAS",
    items: [{ label: "Folha de etiquetas A4", canvaEnv: "CANVA_ETIQUETAS" }],
  },
  {
    code: "bump_mensagens",
    title: "100 Mensagens e Modelos de Anúncios",
    description: "Respostas prontas para orçamento, negociação, pagamento, envio, pós-venda, além de títulos e descrições de anúncio.",
    price: "R$ 14,90",
    format: "PDF · 15 páginas",
    checkoutEnv: "NEXT_PUBLIC_CHECKOUT_BUMP_MENSAGENS",
    items: [{ label: "Baixar PDF", file: "100-mensagens-vendas-3d.pdf" }],
  },
  {
    code: "bump_guia",
    title: "Mini Guia Mercado Livre e Shopee",
    description: "Como escolher o canal, descobrir sua taxa real, anunciar bem, cuidar da reputação e evitar problemas com marcas.",
    price: "R$ 12,90",
    format: "PDF · 6 páginas",
    checkoutEnv: "NEXT_PUBLIC_CHECKOUT_BUMP_GUIA",
    items: [{ label: "Baixar PDF", file: "mini-guia-mercado-livre-shopee.pdf" }],
  },
];

export const EXTRA_CODES = EXTRAS.map((e) => e.code) as ExtraCode[];

/** Lê o link de checkout (precisa ser referência estática para o Next embutir no cliente). */
export function checkoutFor(code: ExtraCode): string | undefined {
  const map: Record<ExtraCode, string | undefined> = {
    bump_mockups: process.env.NEXT_PUBLIC_CHECKOUT_BUMP_MOCKUPS,
    bump_etiquetas: process.env.NEXT_PUBLIC_CHECKOUT_BUMP_ETIQUETAS,
    bump_mensagens: process.env.NEXT_PUBLIC_CHECKOUT_BUMP_MENSAGENS,
    bump_guia: process.env.NEXT_PUBLIC_CHECKOUT_BUMP_GUIA,
  };
  return map[code] || undefined;
}
