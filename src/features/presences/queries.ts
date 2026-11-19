import "server-only";
import { lire } from "@/lib/api/client";
import * as m from "@/lib/api/mock/vie-scolaire";

export const presencesDuJour = () => lire(() => m.presencesDuJour(), "/presences/jour");
export const appelClasse = (classeId: string) => lire(() => m.appelClasse(classeId), `/presences/classes/${classeId}/appel`);
export const listerRetardsSorties = () => lire(() => m.listerRetardsSorties(), "/presences/retards-sorties");
export const retardsRepetes = () => lire(() => m.retardsRepetes(), "/presences/retards-repetes");
