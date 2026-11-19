import "server-only";
import { lire } from "@/lib/api/client";
import * as m from "@/lib/api/mock/vie-scolaire";

export const listerJustificatifs = (statut: "en_attente" | "traites") => lire(() => m.listerJustificatifs(statut), "/justificatifs", { statut });
