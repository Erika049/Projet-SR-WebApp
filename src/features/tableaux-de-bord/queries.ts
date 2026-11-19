// Indicateurs agrégés par espace + compteurs du menu latéral.
import "server-only";
import { lire } from "@/lib/api/client";
import type { CleBadge } from "@/config/navigation";
import type { Role } from "@/types/domain";
import { db } from "@/lib/api/mock/db";
import * as sco from "@/lib/api/mock/scolarite";
import * as vie from "@/lib/api/mock/vie-scolaire";
import * as fin from "@/lib/api/mock/finances";
import * as notes from "@/lib/api/mock/notes";
import * as per from "@/lib/api/mock/personnel";
import * as com from "@/lib/api/mock/communication";
import { aujourdhuiIso } from "@/lib/format";

export function compteursMenu(role: Role): Promise<Partial<Record<CleBadge, number>>> {
  return lire(() => {
    const d = db();
    const notifications = com.listerNotifications(role).compteurs.nonLues;
    switch (role) {
      case "super_admin":
        return { notifications, tickets: d.tickets.filter((t) => t.statut !== "resolu").length };
      case "direction":
        return { notifications, bulletins: d.bulletins.filter((b) => b.statut === "a_valider").length };
      case "secretariat":
        return { notifications, demandes: sco.listerDemandesLiaison().length + d.corrections.filter((c) => c.statut === "a_traiter").length };
      case "surveillant":
        return { notifications, justificatifs: d.justificatifs.filter((j) => j.statut === "en_attente").length };
      case "comptable":
        return { notifications, declarations: d.declarations.filter((x) => x.statut === "en_attente").length, impayes: fin.listerImpayes().nombre };
    }
  }, "/moi/compteurs");
}

export const tableauDirection = () =>
  lire(() => {
    const d = db();
    const rapport = fin.rapportFinancier();
    const pres = vie.presencesDuJour();
    const per_ = d.personnel;
    return {
      eleves: sco.statsEleves(),
      personnel: { total: per_.length, enseignants: per_.filter((p) => p.categorie === "enseignant").length },
      presence: pres,
      finances: rapport,
      aTraiter: {
        bulletins: d.bulletins.filter((b) => b.statut === "a_valider").length,
        impayes30: rapport.plusGrosImpayes.length ? fin.listerImpayes({ filtre: "30" }).total : 0,
        enseignantsAbsents: per_.filter((p) => p.assiduiteMois.absences > 0).length,
        corrections: d.corrections.filter((c) => c.statut === "attente_directeur").length,
        annulations: fin.annulationsEnAttente().length,
      },
      derniersPaiements: fin.derniersPaiements(4),
    };
  }, "/tableaux-de-bord/direction");

export const tableauSecretariat = () =>
  lire(() => {
    const d = db();
    const liaisons = sco.listerDemandesLiaison().length;
    const corrections = d.corrections.filter((c) => c.statut === "a_traiter").length;
    return {
      demandes: { total: liaisons + corrections, liaisons, corrections },
      stats: sco.statsEleves(),
      attenteDirecteur: d.corrections.filter((c) => c.statut === "attente_directeur").length,
      nouveauxDuJour: d.eleves.filter((e) => e.inscritLe === aujourdhuiIso()).length,
      dernieresActions: d.audit.filter((a) => a.acteur.includes("Tchoua")).slice(0, 5),
    };
  }, "/tableaux-de-bord/secretariat");

export const tableauSurveillance = () =>
  lire(() => ({ presence: vie.presencesDuJour(), justificatifs: vie.listerJustificatifs("en_attente"), repetes: vie.retardsRepetes() }), "/tableaux-de-bord/surveillance");

export const tableauComptable = () => lire(() => ({ caisse: fin.caisseDuJour(), impayes: fin.listerImpayes(), declarations: fin.listerDeclarations().length }), "/tableaux-de-bord/comptabilite");

export const statsBulletins = () => lire(() => notes.suiviBulletins("sequence", 1), "/bulletins/suivi");
export const statsPersonnel = () => lire(() => per.assiduitePersonnel(), "/personnel/assiduite");
