const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const num = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

export const money = (v: number | null | undefined) => brl.format(Number(v) || 0);
export const pct = (v: number | null | undefined) => `${num.format(Number(v) || 0)}%`;
export const number = (v: number | null | undefined) => num.format(Number(v) || 0);

/** Lê número de um FormData aceitando vírgula decimal ("12,5"). */
export function fnum(fd: FormData, key: string, fallback = 0): number {
  return parseNum(String(fd.get(key) ?? ""), fallback);
}

/**
 * Aceita os dois formatos: "1.234,56" / "12,5" (pt, es) e "1,234.56" / "12.5" (en).
 * Quando há vírgula e ponto, o último separador é o decimal.
 */
export function parseNum(input: string, fallback = 0): number {
  let raw = input.trim().replace(/[^\d.,-]/g, "");
  const lastComma = raw.lastIndexOf(",");
  const lastDot = raw.lastIndexOf(".");
  if (lastComma > -1 && lastDot > -1) {
    raw = lastComma > lastDot ? raw.replace(/\./g, "").replace(",", ".") : raw.replace(/,/g, "");
  } else if (lastComma > -1) {
    raw = raw.replace(",", ".");
  }
  const v = Number(raw);
  return Number.isFinite(v) && raw !== "" ? v : fallback;
}

export const fstr = (fd: FormData, key: string) => {
  const v = String(fd.get(key) ?? "").trim();
  return v === "" ? null : v;
};

type ErrDict = {
  generic: string;
  limitUpgrade: string;
  limit: (n: number, what: "printers" | "products") => string;
  inactive: string;
  save: string;
};

/** Traduz erros do banco (limites do plano) para mensagens amigáveis no idioma do usuário. */
export function friendlyError(message: string | undefined, e: ErrDict): string {
  if (!message) return e.generic;
  if (message.includes("LIMITE_PLANO")) {
    const m = message.match(/(\d+)\s+(impressoras|produtos)/);
    const base = m ? e.limit(Number(m[1]), m[2] === "impressoras" ? "printers" : "products") : message.replace("LIMITE_PLANO: ", "");
    return base + e.limitUpgrade;
  }
  if (message.includes("PLANO_INATIVO")) return e.inactive;
  return e.save;
}
