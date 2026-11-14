/**
 * Conteúdos extras vendidos à parte (order bumps), em cada idioma.
 * - PDFs ficam em /private/materiais (pt) e /private/materiais/en|es,
 *   fora de /public, e só são entregues pela rota /api/conteudos/[code].
 * - Links de modelo do Canva ficam em variáveis de ambiente do servidor
 *   (CANVA_…, CANVA_…_EN, CANVA_…_ES), para não aparecerem para quem não comprou.
 * - A compra libera o código (bump_…) em qualquer idioma.
 */
import type { Locale } from "@/i18n/config";

export type ExtraCode = "bump_mockups" | "bump_etiquetas" | "bump_mensagens" | "bump_guia";

export interface ExtraItem {
  label: string;
  /** Nome do PDF dentro da pasta de materiais do idioma. */
  file?: string;
  /** Variável de ambiente com o link de modelo do Canva. */
  canvaEnv?: string;
}

export interface Extra {
  code: ExtraCode;
  title: string;
  description: string;
  price: string;
  format: string;
  items: ExtraItem[];
}

const sfx = (l: Locale) => (l === "pt" ? "" : `_${l.toUpperCase()}`);

const DATA: Record<Locale, Extra[]> = {
  pt: [
    {
      code: "bump_mockups",
      title: "Kit 30 Mockups Editáveis",
      description: "Posts e Stories prontos para divulgar suas peças no Instagram. É só trocar a foto, o nome e o preço.",
      price: "R$ 17,90",
      format: "Modelos do Canva",
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
      items: [{ label: "Folha de etiquetas A4", canvaEnv: "CANVA_ETIQUETAS" }],
    },
    {
      code: "bump_mensagens",
      title: "100 Mensagens e Modelos de Anúncios",
      description: "Respostas prontas para orçamento, negociação, pagamento, envio, pós-venda, além de títulos e descrições de anúncio.",
      price: "R$ 14,90",
      format: "PDF · 15 páginas",
      items: [{ label: "Baixar PDF", file: "100-mensagens-vendas-3d.pdf" }],
    },
    {
      code: "bump_guia",
      title: "Mini Guia Mercado Livre e Shopee",
      description: "Como escolher o canal, descobrir sua taxa real, anunciar bem, cuidar da reputação e evitar problemas com marcas.",
      price: "R$ 12,90",
      format: "PDF · 5 páginas",
      items: [{ label: "Baixar PDF", file: "mini-guia-mercado-livre-shopee.pdf" }],
    },
  ],
  en: [
    {
      code: "bump_mockups",
      title: "30 Editable Mockups Kit",
      description: "Ready-made posts and Stories to promote your pieces on Instagram. Just swap the photo, name and price.",
      price: "$7.90",
      format: "Canva templates",
      items: [
        { label: "Feed posts — part 1 (10 templates)", canvaEnv: "CANVA_MOCKUPS_1_EN" },
        { label: "Feed posts — part 2 (11 templates)", canvaEnv: "CANVA_MOCKUPS_2_EN" },
        { label: "Stories (9 templates)", canvaEnv: "CANVA_MOCKUPS_STORIES_EN" },
      ],
    },
    {
      code: "bump_etiquetas",
      title: "Labels & Packaging Pack",
      description: "Product labels, thank-you card, care tag, stickers and shipping label, ready to print.",
      price: "$4.90",
      format: "Canva template (Letter)",
      items: [{ label: "Label sheet", canvaEnv: "CANVA_ETIQUETAS_EN" }],
    },
    {
      code: "bump_mensagens",
      title: "100 Messages & Listing Templates",
      description: "Ready replies for quotes, negotiation, payment, shipping and after-sale, plus listing titles and descriptions.",
      price: "$5.90",
      format: "PDF · 15 pages",
      items: [{ label: "Download PDF", file: "100-messages-3d-sales.pdf" }],
    },
    {
      code: "bump_guia",
      title: "Etsy & Amazon Mini Guide",
      description: "How to choose your channel, find your real fee, list well, protect your reputation and avoid trademark trouble.",
      price: "$5.90",
      format: "PDF · 6 pages",
      items: [{ label: "Download PDF", file: "mini-guide-etsy-amazon.pdf" }],
    },
  ],
  es: [
    {
      code: "bump_mockups",
      title: "Kit de 30 Mockups Editables",
      description: "Posts y Stories listos para promocionar tus piezas en Instagram. Solo cambia la foto, el nombre y el precio.",
      price: "US$ 7.90",
      format: "Plantillas de Canva",
      items: [
        { label: "Posts para el feed — parte 1 (10 plantillas)", canvaEnv: "CANVA_MOCKUPS_1_ES" },
        { label: "Posts para el feed — parte 2 (11 plantillas)", canvaEnv: "CANVA_MOCKUPS_2_ES" },
        { label: "Stories (9 plantillas)", canvaEnv: "CANVA_MOCKUPS_STORIES_ES" },
      ],
    },
    {
      code: "bump_etiquetas",
      title: "Pack de Etiquetas y Empaques",
      description: "Etiquetas de producto, tarjeta de agradecimiento, etiqueta de cuidados, stickers y etiqueta de envío para imprimir.",
      price: "US$ 4.90",
      format: "Plantilla de Canva (A4)",
      items: [{ label: "Hoja de etiquetas A4", canvaEnv: "CANVA_ETIQUETAS_ES" }],
    },
    {
      code: "bump_mensagens",
      title: "100 Mensajes y Plantillas de Anuncios",
      description: "Respuestas listas para presupuestos, negociación, pago, envío y posventa, además de títulos y descripciones de anuncios.",
      price: "US$ 5.90",
      format: "PDF · 15 páginas",
      items: [{ label: "Descargar PDF", file: "100-mensajes-ventas-3d.pdf" }],
    },
    {
      code: "bump_guia",
      title: "Mini Guía Mercado Libre y Amazon",
      description: "Cómo elegir el canal, descubrir tu comisión real, publicar bien, cuidar tu reputación y evitar problemas con marcas.",
      price: "US$ 5.90",
      format: "PDF · 5 páginas",
      items: [{ label: "Descargar PDF", file: "mini-guia-mercado-libre-amazon.pdf" }],
    },
  ],
};

export const extrasFor = (l: Locale) => DATA[l];
/** Compatibilidade: lista em português. */
export const EXTRAS = DATA.pt;
export const EXTRA_CODES = DATA.pt.map((e) => e.code) as ExtraCode[];

/** Pasta dos PDFs do idioma, relativa a /private/materiais. */
export const materialsDir = (l: Locale) => (l === "pt" ? "" : l);

/** Link de checkout do extra no idioma (referências estáticas para o Next embutir no cliente). */
export function checkoutFor(code: ExtraCode, l: Locale = "pt"): string | undefined {
  const map: Record<Locale, Record<ExtraCode, string | undefined>> = {
    pt: {
      bump_mockups: process.env.NEXT_PUBLIC_CHECKOUT_BUMP_MOCKUPS,
      bump_etiquetas: process.env.NEXT_PUBLIC_CHECKOUT_BUMP_ETIQUETAS,
      bump_mensagens: process.env.NEXT_PUBLIC_CHECKOUT_BUMP_MENSAGENS,
      bump_guia: process.env.NEXT_PUBLIC_CHECKOUT_BUMP_GUIA,
    },
    en: {
      bump_mockups: process.env.NEXT_PUBLIC_CHECKOUT_BUMP_MOCKUPS_EN,
      bump_etiquetas: process.env.NEXT_PUBLIC_CHECKOUT_BUMP_ETIQUETAS_EN,
      bump_mensagens: process.env.NEXT_PUBLIC_CHECKOUT_BUMP_MENSAGENS_EN,
      bump_guia: process.env.NEXT_PUBLIC_CHECKOUT_BUMP_GUIA_EN,
    },
    es: {
      bump_mockups: process.env.NEXT_PUBLIC_CHECKOUT_BUMP_MOCKUPS_ES,
      bump_etiquetas: process.env.NEXT_PUBLIC_CHECKOUT_BUMP_ETIQUETAS_ES,
      bump_mensagens: process.env.NEXT_PUBLIC_CHECKOUT_BUMP_MENSAGENS_ES,
      bump_guia: process.env.NEXT_PUBLIC_CHECKOUT_BUMP_GUIA_ES,
    },
  };
  return map[l][code] || undefined;
}

/** Combo "leve todos" (checkout próprio com super desconto). */
export const comboFor = (l: Locale) =>
  l === "pt"
    ? { price: "R$ 29,90", fullPrice: "R$ 55,60", href: process.env.NEXT_PUBLIC_CHECKOUT_BUMP_COMBO }
    : l === "en"
      ? { price: "$12.90", fullPrice: "$24.60", href: process.env.NEXT_PUBLIC_CHECKOUT_BUMP_COMBO_EN }
      : { price: "US$ 12.90", fullPrice: "US$ 24.60", href: process.env.NEXT_PUBLIC_CHECKOUT_BUMP_COMBO_ES };
export const COMBO = { price: "R$ 29,90", fullPrice: "R$ 55,60" };
export const comboCheckout = () => process.env.NEXT_PUBLIC_CHECKOUT_BUMP_COMBO;
export const canvaSuffix = sfx;
