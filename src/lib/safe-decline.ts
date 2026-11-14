/** Só aceita voltar para o próprio Digital Hub (evita redirecionamento aberto). */
export function safeDecline(v: string | string[] | undefined) {
  const s = Array.isArray(v) ? v[0] : v;
  if (!s) return undefined;
  try {
    const u = new URL(s);
    return u.protocol === "https:" && (u.hostname === "appdigitalhub.com.br" || u.hostname.endsWith(".appdigitalhub.com.br")) ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

