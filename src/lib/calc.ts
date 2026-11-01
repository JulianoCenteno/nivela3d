/**
 * Motor de cálculo do Nivela 3D — "Ciclo de Lucro 3D".
 *
 * Todas as funções são puras (sem banco, sem rede) para serem testáveis
 * e reutilizadas tanto na calculadora quanto nos produtos e vendas.
 *
 * Convenções:
 * - Valores monetários em reais (number), arredondados só na exibição.
 * - Percentuais recebidos como número de 0 a 100 (ex.: 12 = 12%).
 * - Margem = lucro ÷ preço de venda (margem sobre o preço, não markup).
 */

export interface CostInput {
  /** Peso da peça em gramas (incluindo suportes/purga). */
  weightG: number;
  /** Tempo de impressão em horas. */
  printHours: number;
  /** Preço do material por kg (R$). */
  materialPricePerKg: number;
  /** Potência média da impressora em watts. */
  printerWatts: number;
  /** Preço da energia por kWh (R$). */
  energyPricePerKwh: number;
  /** Valor pago na impressora (R$) — para calcular o desgaste. */
  printerPrice: number;
  /** Vida útil estimada da impressora em horas de impressão. */
  printerLifetimeHours: number;
  /** Custo de manutenção por hora de impressão (bicos, correias, mesa...). */
  maintenancePerHour: number;
  /** Minutos de trabalho manual (preparo, remoção de suporte, acabamento). */
  laborMinutes: number;
  /** Valor da sua hora de trabalho (R$). */
  laborPerHour: number;
  /** Taxa de falhas/reimpressões (%) aplicada sobre o custo de produção. */
  failureRatePct: number;
  /** Outros custos avulsos por unidade. */
  extraCosts: number;
  /** Soma dos insumos usados na peça (argolas, ímãs, embalagem...). */
  suppliesCost?: number;
}

export interface CostBreakdown {
  material: number;
  energy: number;
  depreciation: number;
  maintenance: number;
  failure: number;
  labor: number;
  supplies: number;
  extras: number;
  /** Custo de produção (material + energia + desgaste + manutenção + falhas). */
  production: number;
  /** Custo total por unidade. */
  total: number;
}

const n = (v: number | null | undefined) =>
  Number.isFinite(v as number) && (v as number) > 0 ? (v as number) : 0;

export function calcCost(i: CostInput): CostBreakdown {
  const hours = n(i.printHours);
  const material = (n(i.weightG) / 1000) * n(i.materialPricePerKg);
  const energy = (n(i.printerWatts) / 1000) * hours * n(i.energyPricePerKwh);
  const depreciation =
    n(i.printerLifetimeHours) > 0 ? (n(i.printerPrice) / n(i.printerLifetimeHours)) * hours : 0;
  const maintenance = n(i.maintenancePerHour) * hours;
  const base = material + energy + depreciation + maintenance;
  const failure = base * (n(i.failureRatePct) / 100);
  const production = base + failure;
  const labor = (n(i.laborMinutes) / 60) * n(i.laborPerHour);
  const extras = n(i.extraCosts);
  const supplies = n(i.suppliesCost);
  return {
    material,
    energy,
    depreciation,
    maintenance,
    failure,
    labor,
    supplies,
    extras,
    production,
    total: production + labor + supplies + extras,
  };
}

export interface ChannelFee {
  /** Comissão percentual do canal (%). */
  feePct: number;
  /** Tarifa fixa por venda (R$). */
  feeFixed: number;
}

export interface PriceResult {
  price: number;
  fee: number;
  profit: number;
  /** Margem sobre o preço de venda, de 0 a 100. */
  marginPct: number;
}

/**
 * Preço sugerido para atingir a margem desejada depois das taxas do canal.
 *   preço = (custo + taxa fixa) ÷ (1 − comissão − margem)
 * Retorna null quando a combinação é impossível (comissão + margem ≥ 100%).
 */
export function suggestPrice(
  unitCost: number,
  targetMarginPct: number,
  channel: ChannelFee = { feePct: 0, feeFixed: 0 },
): PriceResult | null {
  const p = n(channel.feePct) / 100;
  const m = n(targetMarginPct) / 100;
  if (p + m >= 1) return null;
  const price = (n(unitCost) + n(channel.feeFixed)) / (1 - p - m);
  return evaluatePrice(price, unitCost, channel);
}

/** Resultado de vender a um preço específico. */
export function evaluatePrice(
  price: number,
  unitCost: number,
  channel: ChannelFee = { feePct: 0, feeFixed: 0 },
): PriceResult {
  const pr = n(price);
  const fee = pr > 0 ? pr * (n(channel.feePct) / 100) + n(channel.feeFixed) : 0;
  const profit = pr - fee - n(unitCost);
  return { price: pr, fee, profit, marginPct: pr > 0 ? (profit / pr) * 100 : 0 };
}

/** Totais de uma venda (quantidade × unidade, com frete pago pelo vendedor). */
export function saleTotals(s: {
  quantity: number;
  unitPrice: number;
  unitCost: number;
  feePct: number;
  feeFixed: number;
  shippingCost: number;
}) {
  const q = n(s.quantity);
  const revenue = q * n(s.unitPrice);
  const fees = revenue * (n(s.feePct) / 100) + n(s.feeFixed);
  const cost = q * n(s.unitCost) + n(s.shippingCost);
  const profit = revenue - fees - cost;
  return { revenue, fees, cost, profit, marginPct: revenue > 0 ? (profit / revenue) * 100 : 0 };
}

/** Uma linha de insumo usada num produto. */
export interface SupplyUse {
  supply_id: string;
  qty: number;
}

/** Custo dos insumos de uma peça, usando os preços atuais cadastrados. */
export function suppliesCost(uses: SupplyUse[] | null | undefined, prices: Map<string, number>): number {
  return (uses ?? []).reduce((sum, u) => sum + n(u.qty) * n(prices.get(u.supply_id)), 0);
}
