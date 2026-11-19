// Data Access Layer : seul point de lecture de la session côté serveur.
// L'API reste l'autorité finale, mais l'interface ne sert jamais un espace au mauvais rôle.
import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import type { Role } from "@/types/domain";
import { getSession, type Session } from "./session";
import { accueilDuRole } from "./roles";
import { getLang } from "@/lib/i18n/server";

/** Session courante (mise en cache le temps d'une requête) ; redirige vers la connexion si absente. */
export const getCurrentUser = cache(async (): Promise<Session> => {
  const session = await getSession();
  if (!session) redirect(`/${await getLang()}/connexion`);
  return session;
});

/** À appeler dans le layout de chaque espace. */
export async function requireRole(...roles: Role[]): Promise<Session> {
  const session = await getCurrentUser();
  if (!roles.includes(session.role)) redirect(accueilDuRole(session.role, await getLang()));
  return session;
}

/** Variante pour les Server Actions : lève une erreur au lieu de rediriger. */
export async function exigerRole(...roles: Role[]): Promise<Session> {
  const session = await getSession();
  if (!session || !roles.includes(session.role)) {
    throw new Error("Accès refusé / Access denied");
  }
  return session;
}
