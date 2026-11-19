// Lectures « scolarité » : élèves, dossiers, réinscriptions, import, demandes.
import "server-only";
import { lire } from "@/lib/api/client";
import * as m from "@/lib/api/mock/scolarite";

export type { EleveDetaille, FiltreEleves, LigneImport } from "@/lib/api/mock/scolarite";
export { LIBELLE_CHAMP } from "@/lib/api/mock/scolarite";

export const listerEleves = (f: m.FiltreEleves) => lire(() => m.listerEleves(f), "/eleves", f);
export const statsEleves = () => lire(() => m.statsEleves(), "/eleves/statistiques");
export const getEleve = (id: string) => lire(() => m.eleve(id), `/eleves/${id}`);
export const listerReinscriptions = (f: { q?: string; classeId?: string; page?: number }) => lire(() => m.listerReinscriptions(f), "/reinscriptions", f);
export const listerCorrections = (statut?: string) => lire(() => m.listerCorrections(statut), "/corrections", { statut });
export const analyserImport = async (contenu: string) => m.analyserImport(contenu); // contrôle local avant envoi
export const annuaireEleves = () => lire(() => m.annuaireEleves(), "/eleves/annuaire");
