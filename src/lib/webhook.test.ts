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
