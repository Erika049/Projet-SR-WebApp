// Proxy (appelé « middleware » avant Next 16).
// 1. L'application est uniquement en français : toute adresse est ramenée sous /fr (/direction → /fr/direction,
//    /en/direction → /fr/direction).
// 2. Contrôle optimiste : sans cookie de session, les espaces privés renvoient vers /connexion.
//    La vraie autorisation (rôle + établissement) est faite dans la DAL (src/lib/auth/dal.ts) et par l'API.
import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";

const PUBLIQUES = ["/connexion", "/mot-de-passe-oublie", "/invitation"];
const LANGUE = DEFAULT_LOCALE; // "fr"

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname !== `/${LANGUE}` && !pathname.startsWith(`/${LANGUE}/`)) {
    const sansLangue = pathname === "/en" ? "" : pathname.startsWith("/en/") ? pathname.slice(3) : pathname;
    request.nextUrl.pathname = `/${LANGUE}${sansLangue === "/" ? "" : sansLangue}`;
    return NextResponse.redirect(request.nextUrl);
  }

  const reste = pathname.slice(LANGUE.length + 1) || "/";
  const publique = PUBLIQUES.some((p) => reste.startsWith(p));
  if (!publique && reste !== "/" && !request.cookies.has("sc_session")) {
    const url = request.nextUrl.clone();
    url.pathname = `/${LANGUE}/connexion`;
    url.search = "";
    return NextResponse.redirect(url);
  }

  const res = NextResponse.next();
  if (request.cookies.get("NEXT_LOCALE")?.value !== LANGUE) {
    res.cookies.set("NEXT_LOCALE", LANGUE, { path: "/", maxAge: 31536000, sameSite: "lax" });
  }
  return res;
}

export const config = {
  matcher: ["/((?!api|_next|favicon.ico|.*\\..*).*)"],
};
