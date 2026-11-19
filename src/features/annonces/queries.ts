import "server-only";
import { lire } from "@/lib/api/client";
import * as m from "@/lib/api/mock/communication";
import type { Annonce } from "@/types/domain";

export const listerAnnonces = (auteurRole?: Annonce["auteurRole"]) => lire(() => m.listerAnnonces(auteurRole), "/annonces", { auteur: auteurRole });
