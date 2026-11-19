// Route Handler (BFF) : relaie le téléchargement de fichiers protégés depuis l'API Spring Boot
// (bulletins PDF, reçus, pièces justificatives) en ajoutant le jeton de session.
// Le navigateur ne voit jamais le jeton d'accès.
import { getSession } from "@/lib/auth/session";
import { USE_MOCK } from "@/lib/api/client";

export async function GET(_request: Request, ctx: RouteContext<"/api/fichiers/[...chemin]">) {
  const session = await getSession();
  if (!session) return new Response("Non authentifié / Unauthenticated", { status: 401 });
  if (USE_MOCK) return new Response("Fichiers indisponibles en mode données d'exemple / Files unavailable in sample-data mode", { status: 404 });

  const { chemin } = await ctx.params;
  const base = (process.env.API_URL ?? "").replace(/\/$/, "");
  const res = await fetch(`${base}/fichiers/${chemin.map(encodeURIComponent).join("/")}`, {
    headers: {
      ...(session.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
      ...(session.etablissementId ? { "X-Etablissement-Id": session.etablissementId } : {}),
    },
    cache: "no-store",
  });
  return new Response(res.body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/octet-stream",
      "Content-Disposition": res.headers.get("Content-Disposition") ?? "inline",
      "Cache-Control": "private, no-store",
    },
  });
}
