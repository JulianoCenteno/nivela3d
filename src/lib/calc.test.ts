import { describe, expect, it } from "vitest";
import { calcCost, evaluatePrice, saleTotals, suggestPrice, suppliesCost } from "./calc";

const base = {
  weightG: 100,
  printHours: 5,
  materialPricePerKg: 120,
  printerWatts: 200,
  energyPricePerKwh: 1,
  printerPrice: 3000,
  printerLifetimeHours: 6000,
  maintenancePerHour: 0.2,
  laborMinutes: 30,
  laborPerHour: 20,
  failureRatePct: 10,
  extraCosts: 2,
};

describe("calcCost", () => {
  it("soma cada componente corretamente", () => {
    const c = calcCost(base);
    expect(c.material).toBeCloseTo(12); // 0,1 kg × 120
    expect(c.energy).toBeCloseTo(1); // 0,2 kW × 5 h × 1
    expect(c.depreciation).toBeCloseTo(2.5); // 3000/6000 × 5
    expect(c.maintenance).toBeCloseTo(1); // 0,2 × 5
    expect(c.failure).toBeCloseTo(1.65); // 10% de 16,5
    expect(c.production).toBeCloseTo(18.15);
    expect(c.labor).toBeCloseTo(10);
    expect(c.total).toBeCloseTo(30.15);
  });

  it("ignora valores vazios, negativos ou NaN", () => {
    const c = calcCost({ ...base, printerLifetimeHours: 0, extraCosts: -5, laborMinutes: NaN });
    expect(c.depreciation).toBe(0);
    expect(c.extras).toBe(0);
    expect(c.labor).toBe(0);
    expect(Number.isFinite(c.total)).toBe(true);
  });
});

describe("suggestPrice", () => {
  it("atinge exatamente a margem desejada após as taxas", () => {
    const r = suggestPrice(30, 40, { feePct: 20, feeFixed: 4 })!;
    expect(r.price).toBeCloseTo(85); // (30+4)/(1-0,2-0,4)
    expect(r.marginPct).toBeCloseTo(40);
    expect(r.profit).toBeCloseTo(34);
  });

  it("retorna null quando comissão + margem ≥ 100%", () => {
    expect(suggestPrice(30, 80, { feePct: 20, feeFixed: 0 })).toBeNull();
  });
});

describe("evaluatePrice", () => {
  it("mostra prejuízo quando o preço não cobre custos", () => {
    const r = evaluatePrice(20, 30);
    expect(r.profit).toBe(-10);
    expect(r.marginPct).toBeCloseTo(-50);
  });
});

describe("saleTotals", () => {
  it("considera quantidade, taxas e frete", () => {
    const t = saleTotals({ quantity: 2, unitPrice: 50, unitCost: 20, feePct: 10, feeFixed: 3, shippingCost: 5 });
    expect(t.revenue).toBe(100);
    expect(t.fees).toBe(13);
    expect(t.cost).toBe(45);
    expect(t.profit).toBe(42);
  });
});

describe("insumos", () => {
  it("soma quantidade × preço e entra no custo total", () => {
    const prices = new Map([["argola", 0.35], ["ima", 0.5]]);
    const sc = suppliesCost([{ supply_id: "argola", qty: 1 }, { supply_id: "ima", qty: 2 }, { supply_id: "apagado", qty: 3 }], prices);
    expect(sc).toBeCloseTo(1.35);
    const c = calcCost({ ...base, suppliesCost: sc });
    expect(c.supplies).toBeCloseTo(1.35);
    expect(c.total).toBeCloseTo(30.15 + 1.35);
  });
});
