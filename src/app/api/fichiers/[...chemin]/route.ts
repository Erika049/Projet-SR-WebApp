// Route Handler (BFF) : relaie le téléchargement de fichiers protégés depuis l'API Spring Boot
// (pièces justificatives d'absence, preuves de paiement) en ajoutant le jeton de session.
// Le navigateur ne voit jamais le jeton d'accès. Seuls les chemins de l'établissement de la session
// sont acceptés : /api/fichiers/etablissements/{id}/justificatifs/{id}/piece
//                  /api/fichiers/etablissements/{id}/declarations-paiement/{id}/preuve
import { getSession } from "@/lib/auth/session";
import { API_URL } from "@/lib/api/client";
import { cheminFichierAutorise } from "@/lib/api/backend";

export async function GET(_request: Request, ctx: RouteContext<"/api/fichiers/[...chemin]">) {
  const session = await getSession();
  if (!session) return new Response("Non authentifié / Unauthenticated", { status: 401 });

  const { chemin } = await ctx.params;
  if (!session.etablissementId || !cheminFichierAutorise(chemin, session.etablissementId)) {
    return new Response("Accès refusé / Access denied", { status: 403 });
  }
  const res = await fetch(`${API_URL}/${chemin.map(encodeURIComponent).join("/")}`, {
    headers: session.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {},
    cache: "no-store",
  });
  return new Response(res.body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/octet-stream",
      "Content-Disposition": res.headers.get("Content-Disposition") ?? "inline",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
