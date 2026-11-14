import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC = ["/en", "/es", "/oferta", "/login", "/cadastro", "/recuperar-senha", "/auth", "/api/webhooks", "/o"];

const LANDING_LOCALE: Record<string, string> = { "/": "pt", "/oferta": "pt", "/en": "en", "/es": "es", "/oferta/en": "en", "/oferta/es": "es" };

/** Países onde a página de vendas abre em espanhol (fora deles, quem é de fora vê em inglês). */
const ES_COUNTRIES = new Set([
  "MX", "ES", "AR", "CO", "CL", "PE", "UY", "PY", "BO", "EC", "VE", "CR", "PA", "DO", "PR", "GT", "HN", "SV", "NI", "CU", "GQ",
]);
const BOT_UA = /bot|crawl|spider|slurp|facebookexternalhit|facebookcatalog|meta-externalagent|embedly|preview|lighthouse|headless/i;
const SALES_PATH: Record<string, Record<"pt" | "en" | "es", string>> = {
  "/": { pt: "/", en: "/en", es: "/es" },
  "/en": { pt: "/", en: "/en", es: "/es" },
  "/es": { pt: "/", en: "/en", es: "/es" },
  "/oferta": { pt: "/oferta", en: "/oferta/en", es: "/oferta/es" },
  "/oferta/en": { pt: "/oferta", en: "/oferta/en", es: "/oferta/es" },
  "/oferta/es": { pt: "/oferta", en: "/oferta/en", es: "/oferta/es" },
};

/**
 * Idioma da página de vendas pelo país (IP da Vercel) e pelo idioma do navegador.
 * Brasil fica em português; fora do Brasil vai para inglês ou espanhol.
 * Nas páginas /en e /es só troca entre inglês e espanhol (nunca manda para o português).
 */
function geoLocale(request: NextRequest, path: string): "pt" | "en" | "es" | null {
  const country = (request.headers.get("x-vercel-ip-country") || "").toUpperCase();
  const first = (request.headers.get("accept-language") || "").split(",")[0]?.trim().toLowerCase().split(/[-;]/)[0] || "";
  const onForeignPage = path.endsWith("/en") || path.endsWith("/es");
  if (onForeignPage) {
    if (country === "BR") return null;
    if (first === "es") return "es";
    if (first === "en") return "en";
    return null;
  }
  if (country === "BR") return "pt";
  if (!country && !first) return null;
  if (first === "pt") return "pt";
  if (first === "es") return "es";
  if (first === "en") return "en";
  if (country && ES_COUNTRIES.has(country)) return "es";
  return country ? "en" : null;
}

export async function middleware(request: NextRequest) {
  // Página de vendas no idioma do visitante (a menos que ele tenha escolhido o idioma no seletor).
  {
    const path = request.nextUrl.pathname;
    const map = SALES_PATH[path];
    const ua = request.headers.get("user-agent") || "";
    const loggedIn = request.cookies.getAll().some((c) => c.name.startsWith("sb-") && c.name.includes("auth-token"));
    if (
      map &&
      request.method === "GET" &&
      !request.cookies.get("nivela_lang_manual") &&
      !request.nextUrl.searchParams.get("lang") &&
      !BOT_UA.test(ua) &&
      !(loggedIn && path === "/")
    ) {
      const want = geoLocale(request, path);
      if (want && map[want] !== path) {
        const url = request.nextUrl.clone();
        url.pathname = map[want];
        const r = NextResponse.redirect(url, 302);
        r.cookies.set("nivela_locale", want, { path: "/", maxAge: 31536000, sameSite: "lax" });
        return r;
      }
    }
  }

  // Quem chega pela página em inglês/espanhol já entra no app nesse idioma.
  const qLang = request.nextUrl.searchParams.get("lang");
  const landingLocale = LANDING_LOCALE[request.nextUrl.pathname] ?? (qLang === "pt" || qLang === "en" || qLang === "es" ? qLang : undefined);
  if (landingLocale && request.cookies.get("nivela_locale")?.value !== landingLocale) {
    request.cookies.set("nivela_locale", landingLocale);
  }
  let response = NextResponse.next({ request });
  if (landingLocale) response.cookies.set("nivela_locale", landingLocale, { path: "/", maxAge: 31536000, sameSite: "lax" });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (list) => {
          list.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          if (landingLocale) response.cookies.set("nivela_locale", landingLocale, { path: "/", maxAge: 31536000, sameSite: "lax" });
          list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = path === "/" || PUBLIC.some((p) => path === p || path.startsWith(p + "/"));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    const r = NextResponse.redirect(url);
    if (landingLocale) r.cookies.set("nivela_locale", landingLocale, { path: "/", maxAge: 31536000, sameSite: "lax" });
    return r;
  }
  if (user && (path === "/login" || path === "/cadastro" || path === "/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/painel";
    const r = NextResponse.redirect(url);
    if (landingLocale) r.cookies.set("nivela_locale", landingLocale, { path: "/", maxAge: 31536000, sameSite: "lax" });
    return r;
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/|landing/|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
