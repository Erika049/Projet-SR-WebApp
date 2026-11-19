import "server-only";
import { lire } from "@/lib/api/client";
import * as c from "@/lib/api/mock/communication";

export const ticketsEtablissement = (etablissementId: string) => lire(() => c.ticketsEtablissement(etablissementId), "/support/tickets");
