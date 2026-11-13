import { describe, expect, it } from "vitest";
import { parseEvent, parsePlan, parseStatus } from "./webhook";

describe("parseEvent", () => {
  it("entende um payload no estilo Kiwify", () => {
    const e = parseEvent({
      order_status: "paid",
      Customer: { email: "Joao@Email.com" },
      Product: { product_name: "Nivela 3D Profissional - Anual" },
      Subscription: { id: "sub_1" },
    })!;
    expect(e).toMatchObject({ email: "joao@email.com", plan: "profissional", status: "active", cycle: "anual" });
  });

  it("entende um payload no estilo Hotmart", () => {
    const e = parseEvent({ event: "PURCHASE_REFUNDED", data: { buyer: { email: "a@b.com" }, product: { name: "Nivela Empresa" } } })!;
    expect(e).toMatchObject({ email: "a@b.com", plan: "empresa", status: "refunded", cycle: "mensal" });
  });

  it("usa o mapa de IDs de produto quando configurado", () => {
    const e = parseEvent({ email: "x@y.com", status: "approved", product_id: "9876" }, { "9876": "iniciante" })!;
    expect(e.plan).toBe("iniciante");
  });

  it("ignora payload sem e-mail", () => {
    expect(parseEvent({ status: "paid" })).toBeNull();
  });
});

describe("parseStatus / parsePlan", () => {
  it("não confunde inactive com active", () => expect(parseStatus("inactive")).toBe("canceled"));
  it("não confunde 'Produto' com plano Pro", () => expect(parsePlan("Produto Digital")).toBeNull());
  it("reconhece 'Pro'", () => expect(parsePlan("Nivela Pro")).toBe("profissional"));
});

describe("order bumps", () => {
  it("encontra plano e order bumps no mesmo pedido", () => {
    const e = parseEvent({
      status: "paid",
      customer: { email: "a@b.com" },
      product: { name: "Nivela 3D Profissional" },
      items: [{ name: "Nivela 3D Profissional" }, { name: "Kit 30 Mockups Editáveis" }, { name: "Pack de Etiquetas e Embalagens" }],
    })!;
    expect(e.plan).toBe("profissional");
    expect(e.extras.sort()).toEqual(["bump_etiquetas", "bump_mockups"]);
  });

  it("compra só do order bump não vira plano", () => {
    const e = parseEvent({ status: "approved", email: "x@y.com", product_name: "100 Mensagens e Modelos de Anúncios" })!;
    expect(e.plan).toBeNull();
    expect(e.extras).toEqual(["bump_mensagens"]);
  });

  it("usa o mapa de IDs para order bumps", () => {
    const e = parseEvent({ status: "approved", email: "x@y.com", product_id: "777" }, { "777": "bump_guia" })!;
    expect(e.extras).toEqual(["bump_guia"]);
  });
});

describe("formato real do Digital Hub", () => {
  const base = {
    event: "pedido.pago",
    offer: { id: "o1", code: "AB12CD34", name: "Profissional anual", price: 399, recurring: true, interval: "year", interval_count: 1 },
    product: { id: "p1", name: "Nivela 3D" },
    subscription: { id: "s1", status: "ativa", current_period_end: "2027-11-01T00:00:00Z" },
    order: { id: "or1", status: "pago", bumps: [{ name: "Pack de Etiquetas e Embalagens", price: 9.9 }] },
    customer: { name: "Ana", email: "Ana@Loja.com" },
  };

  it("lê plano, ciclo, vencimento e order bump", () => {
    const e = parseEvent(base)!;
    expect(e).toMatchObject({ email: "ana@loja.com", plan: "profissional", status: "active", cycle: "anual", periodEnd: "2027-11-01T00:00:00.000Z" });
    expect(e.extras).toEqual(["bump_etiquetas"]);
  });

  it("pagamento recusado não libera nada", () => {
    expect(parseEvent({ ...base, event: "pedido.recusado" })!.status).toBeNull();
  });

  it("assinatura cancelada e reembolso", () => {
    expect(parseEvent({ ...base, event: "assinatura.cancelada" })!.status).toBe("canceled");
    expect(parseEvent({ ...base, event: "pedido.reembolsado" })!.status).toBe("refunded");
    expect(parseEvent({ ...base, event: "assinatura.renovada" })!.status).toBe("active");
  });

  it("oferta mapeada pelo código", () => {
    const e = parseEvent({ ...base, offer: { code: "ZZ99", name: "Oferta X" } }, { ZZ99: "empresa" })!;
    expect(e.plan).toBe("empresa");
  });
});

describe("combo leve todos", () => {
  it("bump combo libera os 4 materiais e mantém o plano", () => {
    const e = parseEvent({
      event: "pedido.pago",
      customer: { email: "a@b.com" },
      offer: { code: "3DC61E0F", name: "Profissional — Mensal", interval: "month", interval_count: 1 },
      product: { name: "Nivela 3D — Gestão para Impressão 3D" },
      order: { status: "paid", bumps: [{ name: "Combo Leve Todos: 4 Materiais Nivela 3D", price: 29.9 }] },
    });
    expect(e!.plan).toBe("profissional");
    expect(e!.extras.sort()).toEqual(["bump_etiquetas", "bump_guia", "bump_mensagens", "bump_mockups"]);
  });
});

describe("compra vitalícia", () => {
  it("reconhece oferta vitalícia pelo nome", () => {
    const e = parseEvent({ status: "paid", customer: { email: "v@x.com" }, offer: { name: "Nivela 3D Iniciante — Vitalício" } })!;
    expect(e).toMatchObject({ plan: "iniciante", status: "active", lifetime: true });
  });

  it("reconhece intervalo não recorrente da oferta", () => {
    const e = parseEvent({ status: "paid", customer: { email: "v@x.com" }, offer: { name: "Nivela 3D Profissional", interval: "one_time" } })!;
    expect(e).toMatchObject({ plan: "profissional", lifetime: true });
  });

  it("assinatura mensal não é vitalícia", () => {
    const e = parseEvent({ status: "paid", customer: { email: "v@x.com" }, offer: { name: "Nivela 3D Profissional", interval: "month", interval_count: 1 } })!;
    expect(e).toMatchObject({ plan: "profissional", cycle: "mensal", lifetime: false });
  });

  it("order bump vitalício não marca o plano como vitalício", () => {
    const e = parseEvent({
      status: "paid", customer: { email: "v@x.com" },
      offer: { name: "Nivela 3D Profissional", interval: "month" },
      order: { bumps: [{ name: "Mockups prontos (acesso vitalício)" }] },
    })!;
    expect(e.lifetime).toBe(false);
    expect(e.extras).toContain("bump_mockups");
  });
});
