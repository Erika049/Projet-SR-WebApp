// Client HTTP côté serveur vers l'API Spring Boot.
// - Le jeton d'accès est lu dans la session (cookie httpOnly) et n'atteint jamais le navigateur.
// - L'établissement courant est transmis dans l'en-tête X-Etablissement-Id (multi-tenant).
// - Si USE_MOCK_API n'est pas "false", les fonctions lire()/ecrire() utilisent les données d'exemple.
import "server-only";
import { connection } from "next/server";
import { getSession } from "@/lib/auth/session";
import { ApiError } from "./errors";

export const USE_MOCK = process.env.USE_MOCK_API !== "false";
const API_URL = process.env.API_URL ?? "http://localhost:8080/api";

type Query = Record<string, string | number | boolean | undefined | null>;

function construireUrl(path: string, query?: Query) {
  const url = new URL(API_URL.replace(/\/$/, "") + path);
  for (const [k, v] of Object.entries(query ?? {})) {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, String(v));
  }
  return url;
}

export async function apiFetch<T>(
  path: string,
  init: { method?: string; body?: unknown; query?: Query } = {},
): Promise<T> {
  const session = await getSession();
  const res = await fetch(construireUrl(path, init.query), {
    method: init.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(session?.accessToken ? { Authorization: `Bearer ${session.accessToken}` } : {}),
      ...(session?.etablissementId ? { "X-Etablissement-Id": session.etablissementId } : {}),
      "Accept-Language": session?.langue ?? "fr",
    },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    cache: "no-store",
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { message?: string; code?: string };
    throw new ApiError(res.status, data.message ?? res.statusText, data.code);
  }
  return (res.status === 204 ? undefined : await res.json()) as T;
}

/** Lecture : données d'exemple en mode mock, sinon GET sur l'API. */
export async function lire<T>(mock: () => T, path: string, query?: Query): Promise<T> {
  if (USE_MOCK) {
    await connection(); // données lues à chaque requête, jamais figées au build
    return mock();
  }
  return apiFetch<T>(path, { query });
}

/** Écriture (Server Actions) : mutation des données d'exemple, sinon appel à l'API. */
export async function ecrire<T>(
  mock: () => T,
  path: string,
  method: "POST" | "PUT" | "PATCH" | "DELETE" = "POST",
  body?: unknown,
): Promise<T> {
  if (USE_MOCK) return mock();
  return apiFetch<T>(path, { method, body });
}
