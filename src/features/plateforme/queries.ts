// Lectures « plateforme » (super-admin).
import "server-only";
import { lire } from "@/lib/api/client";
import * as m from "@/lib/api/mock/plateforme";
import * as c from "@/lib/api/mock/communication";

export const vueEnsemble = () => lire(() => m.vueEnsemble(), "/plateforme/statistiques");
export const listerEtablissements = (f: { q?: string; statut?: string; page?: number }) => lire(() => m.listerEtablissements(f), "/plateforme/etablissements", f);
export const getEtablissement = (id: string) => lire(() => m.etablissement(id), `/plateforme/etablissements/${id}`);
export const prochainCode = () => lire(() => m.prochainCode(), "/plateforme/etablissements/prochain-code");
export const abonnements = (f: { filtre?: string; page?: number }) => lire(() => m.abonnements(f), "/plateforme/abonnements", f);
export const listerTickets = (statut?: string) => lire(() => m.listerTickets(statut), "/plateforme/tickets", { statut });
export const getTicket = (id: string) => lire(() => m.ticket(id), `/plateforme/tickets/${id}`);
export const comptesPlateforme = () => lire(() => m.comptesPlateforme(), "/plateforme/utilisateurs");
export const journalPlateforme = (page: number) => lire(() => c.journalAudit(null, page), "/plateforme/audit", { page });
