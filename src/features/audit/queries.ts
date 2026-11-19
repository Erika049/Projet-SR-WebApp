import "server-only";
import { lire } from "@/lib/api/client";
import * as m from "@/lib/api/mock/communication";
import * as sco from "@/lib/api/mock/scolarite";

export const journalAudit = (etablissementId: string, page: number) => lire(() => m.journalAudit(etablissementId, page), "/audit", { page });
export const comptesEtablissement = (categorie?: string) => lire(() => m.comptesEtablissement(categorie), "/utilisateurs", { categorie });
export const correctionsAValider = () => lire(() => sco.listerCorrections("attente_directeur"), "/corrections", { statut: "attente_directeur" });
