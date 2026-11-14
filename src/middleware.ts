import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC = ["/en", "/es", "/oferta", "/login", "/cadastro", "/recuperar-senha", "/auth", "/api/webhooks", "/o"];

const LANDING_LOCALE: Record<string, string> = { "/": "pt", "/oferta": "pt", "/en": "en", "/es": "es", "/oferta/en": "en", "/oferta/es": "es" };

export async function middleware(request: NextRequest) {
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
    return NextResponse.redirect(url);
  }
  if (user && (path === "/login" || path === "/cadastro" || path === "/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/painel";
    return NextResponse.redirect(url);
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|brand/|landing/|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)"],
};
