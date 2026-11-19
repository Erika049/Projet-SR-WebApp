import "server-only";
import { lire, USE_MOCK } from "@/lib/api/client";
import * as m from "@/lib/api/mock/plateforme";

/** Comptes de démonstration affichés sur l'écran de connexion (mode données d'exemple uniquement). */
export const comptesDemo = () => (USE_MOCK ? lire(() => m.comptesDemo(), "/") : Promise.resolve([]));
export const getUtilisateur = (id: string) => lire(() => m.utilisateur(id), "/moi");
