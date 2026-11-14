/** Bônus do plano: PDFs em /private/materiais (pt) e /private/materiais/en|es, liberados para quem tem plano ativo. */
import type { Locale } from "@/i18n/config";

export interface Bonus {
  slug: string;
  title: string;
  description: string;
  file: string;
}

const DATA: Record<Locale, Bonus[]> = {
  pt: [
    { slug: "primeiras-vendas", title: "Primeiras Vendas com Lucro", description: "Como começar a vender suas peças sem deixar dinheiro na mesa.", file: "bonus-primeiras-vendas-com-lucro.pdf" },
    { slug: "checklist-antidesperdicio", title: "Checklist Antidesperdício", description: "Evite as falhas que jogam filamento, tempo e lucro fora.", file: "bonus-checklist-antidesperdicio.pdf" },
    { slug: "20-ideias", title: "20 Ideias de Produtos para Vender", description: "Inspiração por categoria e por público.", file: "bonus-20-ideias-de-produtos.pdf" },
    { slug: "mensagens-clientes", title: "Modelos de Mensagens para Clientes", description: "Respostas rápidas para orçamentos e pedidos.", file: "bonus-modelos-de-mensagens.pdf" },
  ],
  en: [
    { slug: "primeiras-vendas", title: "First Sales with Profit", description: "How to start selling your pieces without leaving money on the table.", file: "bonus-first-sales-with-profit.pdf" },
    { slug: "checklist-antidesperdicio", title: "Anti-Waste Checklist", description: "Avoid the failures that throw filament, time and profit away.", file: "bonus-anti-waste-checklist.pdf" },
    { slug: "20-ideias", title: "20 Product Ideas to Sell", description: "Inspiration by category and audience.", file: "bonus-20-product-ideas.pdf" },
    { slug: "mensagens-clientes", title: "Customer Message Templates", description: "Quick replies for quotes and orders.", file: "bonus-customer-messages.pdf" },
  ],
  es: [
    { slug: "primeiras-vendas", title: "Primeras Ventas con Ganancia", description: "Cómo empezar a vender tus piezas sin dejar dinero sobre la mesa.", file: "bonus-primeras-ventas-con-ganancia.pdf" },
    { slug: "checklist-antidesperdicio", title: "Checklist Antidesperdicio", description: "Evita las fallas que tiran filamento, tiempo y ganancia.", file: "bonus-checklist-antidesperdicio.pdf" },
    { slug: "20-ideias", title: "20 Ideas de Productos para Vender", description: "Inspiración por categoría y por público.", file: "bonus-20-ideas-de-productos.pdf" },
    { slug: "mensagens-clientes", title: "Plantillas de Mensajes para Clientes", description: "Respuestas rápidas para presupuestos y pedidos.", file: "bonus-plantillas-de-mensajes.pdf" },
  ],
};

export const bonusesFor = (l: Locale) => DATA[l];
export const BONUSES = DATA.pt;
