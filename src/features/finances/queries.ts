import "server-only";
import { lire } from "@/lib/api/client";
import * as m from "@/lib/api/mock/finances";

export const getSituation = (eleveId: string) => lire(() => m.situation(eleveId), `/finances/eleves/${eleveId}`);
export const rechercherEleves = (q: string) => lire(() => m.rechercherEleves(q), "/finances/eleves", { q });
export const listerImpayes = (f: { filtre?: string; page?: number; q?: string }) => lire(() => m.listerImpayes(f), "/finances/impayes", f);
export const getPaiement = (id: string) => lire(() => m.paiement(id), `/finances/paiements/${id}`);
export const listerDeclarations = () => lire(() => m.listerDeclarations(), "/finances/declarations");
export const caisseDuJour = () => lire(() => m.caisseDuJour(), "/finances/caisse/jour");
export const rapportFinancier = () => lire(() => m.rapportFinancier(), "/finances/rapports");
export const grilleTarifaire = () => lire(() => m.grilleTarifaire(), "/finances/tarifs");
export const annulationsEnAttente = () => lire(() => m.annulationsEnAttente(), "/finances/paiements/annulations");
