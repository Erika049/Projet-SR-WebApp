// Client HTTP côté serveur vers l'API Spring Boot SchoolConnect (/api/v1).
// Le jeton d'accès est lu dans la session (cookie httpOnly) et n'atteint jamais le navigateur.
import "server-only";
import { getSession } from "@/lib/auth/session";
import { ApiError } from "./errors";

export const API_URL = (process.env.API_URL ?? "http://localhost:8080/api/v1").replace(/\/$/, "");

type Query = Record<string, string | number | boolean | undefined | null>;

function construireUrl(path: string, query?: Query) {
  const url = new URL(API_URL + path);
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  return url;
}

/**
 * Format d'erreur du backend : { status, message: "Bad Request", error: "Données invalides", details: { champ: "…" } }.
 * Le texte destiné à l'utilisateur est dans `error` (complété par `details`).
 */
async function erreurApi(res: Response, avecJeton: boolean): Promise<ApiError> {
  const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string; details?: Record<string, string> };
  const details =
    data.details && Object.keys(data.details).length
      ? " : " + Object.entries(data.details).map(([k, v]) => `${k} (${v})`).join(", ")
      : "";
  const texte = data.error ?? data.message ?? res.statusText;
  // 401 sans jeton = identifiants refusés à la connexion ; avec jeton = session expirée côté backend.
  const message =
    res.status === 401 && avecJeton
      ? "Session expirée. Reconnectez-vous."
      : res.status === 403 && !data.error
        ? "Accès refusé."
        : texte + details;
  return new ApiError(res.status, message);
}

export async function apiFetch<T>(
  path: string,
  init: { method?: string; body?: unknown; query?: Query; jeton?: string } = {},
): Promise<T> {
  const jeton = init.jeton ?? (await getSession())?.accessToken;
  let res: Response;
  try {
    res = await fetch(construireUrl(path, init.query), {
      method: init.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(jeton ? { Authorization: `Bearer ${jeton}` } : {}),
      },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: "no-store",
    });
  } catch {
    throw new ApiError(503, "Le serveur SchoolConnect est injoignable. Réessayez dans un instant.");
  }
  if (!res.ok) throw await erreurApi(res, Boolean(jeton));
  const texte = res.status === 204 ? "" : await res.text();
  return (texte ? JSON.parse(texte) : undefined) as T;
}
