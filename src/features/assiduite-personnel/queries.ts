import "server-only";
import { lire } from "@/lib/api/client";
import * as m from "@/lib/api/mock/personnel";

export const assiduitePersonnel = () => lire(() => m.assiduitePersonnel(), "/personnel/assiduite");
export const presencesPersonnelDuJour = () => lire(() => m.presencesPersonnelDuJour(), "/personnel/presences/jour");
