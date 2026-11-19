// Proxy (appelé « middleware » avant Next 16).
// 1. Préfixe la langue : /direction → /fr/direction (cookie NEXT_LOCALE, sinon Accept-Language, sinon fr).
// 2. Mémorise la langue de l'URL dans le cookie NEXT_LOCALE (lu par les Server Actions).
// 3. Contrôle optimiste : sans cookie de session, les espaces privés renvoient vers /connexion.
//    La vraie autorisation (rôle + établissement) est faite dans la DAL (src/lib/auth/dal.ts) et par l'API.
import { NextResponse, type NextRequest } from "next/server";
import { LOCALES, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";

const PUBLIQUES = ["/connexion", "/mot-de-passe-oublie", "/invitation"];

function langueNavigateur(request: NextRequest): Locale {
  const accept = request.headers.get("accept-language") ?? "";
  return /^en\b/i.test(accept.trim()) ? "en" : DEFAULT_LOCALE;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const lang = LOCALES.find((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));

  if (!lang) {
    const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
    const locale = LOCALES.find((l) => l === cookieLocale) ?? langueNavigateur(request);
    request.nextUrl.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(request.nextUrl);
  }

  const reste = pathname.slice(lang.length + 1) || "/";
  const publique = PUBLIQUES.some((p) => reste.startsWith(p));
  if (!publique && reste !== "/" && !request.cookies.has("sc_session")) {
    const url = request.nextUrl.clone();
    url.pathname = `/${lang}/connexion`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  if (request.cookies.get("NEXT_LOCALE")?.value !== lang) {
    res.cookies.set("NEXT_LOCALE", lang, { path: "/", maxAge: 31536000, sameSite: "lax" });
  }
  return res;
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"],
};
