// Données d'exemple — annonces, notifications, journal d'audit, comptes de l'établissement, support.
import "server-only";
import type { Annonce, Role, Ticket } from "@/types/domain";
import { ErreurMetier } from "../errors";
import { paginer } from "../pagination";
import { db, journaliser, maintenant, nouvelId, notifier, ECOLE_ID } from "./db";

// ---------- Annonces ----------
export function listerAnnonces(auteurRole?: Annonce["auteurRole"]) {
  const d = db();
  return d.annonces
    .filter((a) => !auteurRole || a.auteurRole === auteurRole)
    .sort((a, b) => b.date.localeCompare(a.date))
    .map((a) => ({ ...a, classes: a.classeIds.map((id) => d.classes.find((c) => c.id === id)?.libelle ?? "") }));
}

export function enregistrerAnnonce(
  data: Pick<Annonce, "titre" | "message" | "type" | "cible" | "classeIds" | "canaux"> & { mode: "publier" | "programmer" | "brouillon"; date?: string },
  auteurRole: Annonce["auteurRole"],
  acteur: string,
) {
  const d = db();
  const a: Annonce = {
    id: nouvelId("ann"),
    titre: data.titre,
    message: data.message,
    type: data.type,
    cible: data.cible,
    classeIds: data.cible === "classe" ? data.classeIds : [],
    canaux: data.canaux,
    auteurRole,
    statut: data.mode === "publier" ? "publiee" : data.mode === "programmer" ? "programmee" : "brouillon",
    date: data.mode === "programmer" && data.date ? `${data.date}T08:00:00` : maintenant(),
  };
  d.annonces.unshift(a);
  if (a.statut === "publiee") {
    const roles: Role[] = auteurRole === "direction" ? ["secretariat", "surveillant", "comptable"] : ["direction", "secretariat"];
    for (const r of roles) notifier(r, "annonce", auteurRole === "direction" ? "Annonce de la direction" : "Annonce publiée", a.titre);
  }
  journaliser(ECOLE_ID, acteur, a.statut === "publiee" ? "Annonce publiée" : a.statut === "programmee" ? "Annonce programmée" : "Brouillon enregistré", a.titre);
  return { id: a.id, statut: a.statut };
}

export function publierAnnonce(id: string, acteur: string) {
  const a = db().annonces.find((x) => x.id === id);
  if (!a) throw new ErreurMetier("Annonce introuvable.", "Announcement not found.");
  a.statut = "publiee";
  a.date = maintenant();
  journaliser(ECOLE_ID, acteur, "Annonce publiée", a.titre);
}

export function supprimerAnnonce(id: string, acteur: string) {
  const d = db();
  const a = d.annonces.find((x) => x.id === id);
  if (!a || a.statut === "publiee") throw new ErreurMetier("Seuls les brouillons et annonces programmées peuvent être supprimés.", "Only drafts and scheduled announcements can be deleted.");
  d.annonces = d.annonces.filter((x) => x.id !== id);
  journaliser(ECOLE_ID, acteur, "Annonce supprimée", a.titre);
}

// ---------- Notifications ----------
export function listerNotifications(role: Role, filtre: "toutes" | "non_lues" | "archivees" = "toutes") {
  const toutes = db().notifications.filter((n) => n.role === role);
  return {
    items: toutes
      .filter((n) => (filtre === "archivees" ? n.archivee : !n.archivee))
      .filter((n) => filtre !== "non_lues" || !n.lue)
      .sort((a, b) => b.date.localeCompare(a.date)),
    compteurs: {
      toutes: toutes.filter((n) => !n.archivee).length,
      nonLues: toutes.filter((n) => !n.lue && !n.archivee).length,
      archivees: toutes.filter((n) => n.archivee).length,
    },
  };
}

export function marquerToutLu(role: Role) {
  db().notifications.filter((n) => n.role === role).forEach((n) => (n.lue = true));
}

export function marquerLue(id: string, role: Role) {
  const n = db().notifications.find((x) => x.id === id && x.role === role);
  if (n) n.lue = true;
}

export function archiverNotification(id: string, role: Role) {
  const n = db().notifications.find((x) => x.id === id && x.role === role);
  if (n) {
    n.archivee = true;
    n.lue = true;
  }
}

export const TYPES_PREFERENCES: Record<Role, { type: string; libelle: [string, string]; critique?: boolean }[]> = {
  super_admin: [
    { type: "ticket", libelle: ["Tickets urgents", "Urgent tickets"], critique: true },
    { type: "abonnement", libelle: ["Abonnements à échéance", "Expiring subscriptions"] },
    { type: "etablissement", libelle: ["Nouveaux établissements", "New schools"] },
    { type: "securite", libelle: ["Alertes de sécurité", "Security alerts"], critique: true },
    { type: "resume", libelle: ["Résumé quotidien par e-mail", "Daily email digest"] },
  ],
  direction: [
    { type: "bulletin", libelle: ["Bulletins à valider", "Report cards to approve"] },
    { type: "correction", libelle: ["Corrections d'identité", "Identity corrections"], critique: true },
    { type: "finance", libelle: ["Impayés et annulations", "Arrears and cancellations"] },
    { type: "personnel", libelle: ["Absences du personnel", "Staff absences"] },
    { type: "annonce", libelle: ["Annonces publiées", "Published announcements"] },
  ],
  secretariat: [
    { type: "liaison", libelle: ["Demandes de liaison", "Link requests"] },
    { type: "correction", libelle: ["Corrections validées ou refusées", "Approved or rejected corrections"] },
    { type: "dossier", libelle: ["Dossiers incomplets", "Incomplete files"] },
    { type: "annonce", libelle: ["Annonces publiées", "Published announcements"] },
  ],
  surveillant: [
    { type: "justificatif", libelle: ["Justificatifs reçus", "Absence notes received"] },
    { type: "signalement", libelle: ["Signalements des enseignants", "Teacher reports"] },
    { type: "retard", libelle: ["Retards répétés", "Repeated lateness"] },
    { type: "annonce", libelle: ["Annonces de la direction", "Management announcements"] },
  ],
  comptable: [
    { type: "declaration", libelle: ["Déclarations des parents", "Parent declarations"] },
    { type: "impaye", libelle: ["Impayés critiques", "Critical arrears"], critique: true },
    { type: "caisse", libelle: ["Rappel de clôture de caisse", "Cash closing reminder"] },
    { type: "tarif", libelle: ["Modification des tarifs", "Fee changes"] },
  ],
};

export function preferences(userId: string, role: Role) {
  const p = db().preferences[userId] ?? {};
  return TYPES_PREFERENCES[role].map((t) => ({ ...t, actif: t.critique ? true : (p[t.type] ?? true) }));
}

export function enregistrerPreferences(userId: string, role: Role, actifs: string[]) {
  db().preferences[userId] = Object.fromEntries(TYPES_PREFERENCES[role].map((t) => [t.type, t.critique ? true : actifs.includes(t.type)]));
}

// ---------- Audit et comptes de l'établissement ----------
export function journalAudit(etablissementId: string | null, page = 1) {
  const items = db().audit.filter((a) => (etablissementId === null ? true : a.etablissementId === etablissementId)).sort((a, b) => b.date.localeCompare(a.date));
  return paginer(items, page, 10);
}

export function comptesEtablissement(categorie?: string) {
  const d = db();
  const users = d.utilisateurs.filter((u) => u.etablissementId === ECOLE_ID);
  const lignes = d.personnel
    .filter((p) => p.compte.acces !== "aucun")
    .map((p) => {
      const u = users.find((x) => x.personnelId === p.id);
      return {
        personnel: p,
        role: u?.role ?? null,
        statut: p.statut === "suspendu" ? "suspendu" : p.statut === "conge" ? "conge" : p.compte.invitation === "envoyee" ? "invite" : "actif",
        derniereConnexion: u?.derniereConnexion ?? p.compte.derniereConnexion,
      };
    });
  return {
    lignes: lignes.filter((l) => !categorie || l.personnel.categorie === categorie),
    compteurs: {
      tous: lignes.length,
      enseignant: lignes.filter((l) => l.personnel.categorie === "enseignant").length,
      administration: lignes.filter((l) => l.personnel.categorie === "administration").length,
      surveillance: lignes.filter((l) => l.personnel.categorie === "surveillance").length,
    },
  };
}

// ---------- Support (côté établissement) ----------
export function ticketsEtablissement(etablissementId: string) {
  return db().tickets.filter((t) => t.etablissementId === etablissementId).sort((a, b) => b.creeLe.localeCompare(a.creeLe));
}

export function creerTicket(data: { objet: string; type: Ticket["type"]; module: string; description: string }, etablissementId: string, acteur: string) {
  const d = db();
  const numero = Math.max(...d.tickets.map((t) => t.numero)) + 1;
  const t: Ticket = {
    id: `tck-${numero}`,
    numero,
    etablissementId,
    objet: data.objet,
    type: data.type,
    module: data.module,
    priorite: data.type === "bug" ? "normal" : "faible",
    statut: "ouvert",
    creeLe: maintenant(),
    auteur: acteur,
    messages: [{ auteur: acteur, support: false, date: maintenant(), texte: data.description }],
  };
  d.tickets.unshift(t);
  notifier("super_admin", "ticket", "Nouveau ticket", `${data.objet} · ${d.etablissements.find((e) => e.id === etablissementId)?.nom}`, `/plateforme/support/${t.id}`);
  journaliser(etablissementId, acteur, "Ticket de support créé", `#${numero} · ${data.objet}`);
  return { numero };
}
