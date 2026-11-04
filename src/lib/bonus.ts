/** Bônus da assinatura: PDFs em /private/materiais, liberados para quem tem plano ativo. */
export interface Bonus {
  slug: string;
  title: string;
  description: string;
  file: string;
}

export const BONUSES: Bonus[] = [
  { slug: "primeiras-vendas", title: "Primeiras Vendas com Lucro", description: "Como começar a vender suas peças sem deixar dinheiro na mesa.", file: "bonus-primeiras-vendas-com-lucro.pdf" },
  { slug: "checklist-antidesperdicio", title: "Checklist Antidesperdício", description: "Evite as falhas que jogam filamento, tempo e lucro fora.", file: "bonus-checklist-antidesperdicio.pdf" },
  { slug: "20-ideias", title: "20 Ideias de Produtos para Vender", description: "Inspiração por categoria e por público.", file: "bonus-20-ideias-de-produtos.pdf" },
  { slug: "mensagens-clientes", title: "Modelos de Mensagens para Clientes", description: "Respostas rápidas para orçamentos e pedidos.", file: "bonus-modelos-de-mensagens.pdf" },
];
