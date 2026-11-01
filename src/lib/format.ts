const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const num = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 2 });

export const money = (v: number | null | undefined) => brl.format(Number(v) || 0);
export const pct = (v: number | null | undefined) => `${num.format(Number(v) || 0)}%`;
export const number = (v: number | null | undefined) => num.format(Number(v) || 0);

/** Lê número de um FormData aceitando vírgula decimal ("12,5"). */
export function fnum(fd: FormData, key: string, fallback = 0): number {
  return parseNum(String(fd.get(key) ?? ""), fallback);
}

/** "1.234,56" → 1234.56 · "12,5" → 12.5 · "12.5" → 12.5 */
export function parseNum(input: string, fallback = 0): number {
  let raw = input.trim().replace(/[R$\s%]/g, "");
  if (raw.includes(",")) raw = raw.replace(/\./g, "").replace(",", ".");
  const v = Number(raw);
  return Number.isFinite(v) && raw !== "" ? v : fallback;
}

export const fstr = (fd: FormData, key: string) => {
  const v = String(fd.get(key) ?? "").trim();
  return v === "" ? null : v;
};

/** Traduz erros do banco (limites do plano) para mensagens amigáveis. */
export function friendlyError(message: string | undefined): string {
  if (!message) return "Algo deu errado. Tente novamente.";
  if (message.includes("LIMITE_PLANO")) return message.replace("LIMITE_PLANO: ", "") + " Faça upgrade para cadastrar mais.";
  if (message.includes("PLANO_INATIVO")) return "Sua assinatura não está ativa. Renove para continuar cadastrando.";
  return "Não foi possível salvar. Confira os campos e tente novamente.";
}
