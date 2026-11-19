import "server-only";
import { lire } from "@/lib/api/client";
import * as m from "@/lib/api/mock/scolarite";

export const listerDemandesLiaison = () => lire(() => m.listerDemandesLiaison(), "/liaisons/demandes");
