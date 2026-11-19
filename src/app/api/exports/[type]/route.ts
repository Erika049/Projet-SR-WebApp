// Route Handler : exports compatibles Excel (CSV UTF-8 avec BOM, séparateur « ; ») — CU-DIR-09, CU-ECO-09.
// En mode données d'exemple, les fichiers sont produits ici ; sinon la requête est relayée à l'API Spring Boot.
import { getSession } from "@/lib/auth/session";
import { USE_MOCK, apiFetch } from "@/lib/api/client";
import type { Role } from "@/types/domain";
import * as per from "@/lib/api/mock/personnel";
import * as fin from "@/lib/api/mock/finances";
import * as notes from "@/lib/api/mock/notes";
import { db } from "@/lib/api/mock/db";

type Table = { entetes: string[]; lignes: (string | number)[][] };

const EXPORTS: Record<string, { roles: Role[]; fichier: string; construire: (p: URLSearchParams) => Table }> = {
  eleves: {
    roles: ["direction", "secretariat"],
    fichier: "eleves",
    construire: () => {
      const d = db();
      return {
        entetes: ["Matricule", "Nom", "Prénom", "Sexe", "Date de naissance", "Classe", "Redoublant", "Tuteur", "Téléphone tuteur", "Accès parent"],
        lignes: d.eleves.filter((e) => e.statut === "actif").map((e) => [e.matricule, e.nom, e.prenom, e.sexe, e.dateNaissance, d.classes.find((c) => c.id === e.classeId)?.libelle ?? "", e.redoublant ? "Oui" : "Non", e.tuteur.nom, e.tuteur.telephone, e.liaison]),
      };
    },
  },
  personnel: {
    roles: ["direction"],
    fichier: "personnel",
    construire: () => {
      const d = db();
      return {
        entetes: ["Matricule", "Civilité", "Nom", "Prénom", "Fonction", "Spécialité", "Contrat", "Classes", "Heures/semaine", "Statut"],
        lignes: d.personnel.map((p) => [p.matricule, p.civilite, p.nom, p.prenom, p.fonction, p.specialite, p.contrat, p.affectations.map((a) => d.classes.find((c) => c.id === a.classeId)?.libelle).join(", "), p.heuresSemaine, p.statut]),
      };
    },
  },
  "assiduite-personnel": {
    roles: ["direction", "surveillant"],
    fichier: "assiduite-personnel",
    construire: () => ({
      entetes: ["Matricule", "Nom", "Matière", "Heures prévues", "Heures effectuées", "Retards", "Absences", "Non justifiées"],
      lignes: per.assiduitePersonnel().lignes.map((p) => [p.matricule, `${p.civilite} ${p.nom}`, p.specialite, p.assiduiteMois.heuresPrevues, p.assiduiteMois.heuresEffectuees, p.assiduiteMois.retards, p.assiduiteMois.absences, p.assiduiteMois.absencesNonJustifiees]),
    }),
  },
  bulletins: {
    roles: ["direction"],
    fichier: "suivi-bulletins",
    construire: (p) => ({
      entetes: ["Classe", "Notes saisies (%)", "Statut"],
      lignes: notes.suiviBulletins(p.get("vue") === "trimestre" ? "trimestre" : "sequence", Number(p.get("n")) || 1).lignes.map((l) => [l.classe.libelle, l.progression, l.statut]),
    }),
  },
  impayes: {
    roles: ["comptable", "direction"],
    fichier: "impayes",
    construire: () => {
      const d = db();
      const toutes = d.eleves.filter((e) => e.statut === "actif").map((e) => fin.situation(e.id)!).filter((s) => s.montantEchu > 0);
      return {
        entetes: ["Matricule", "Élève", "Classe", "Montant en retard (FCFA)", "Solde (FCFA)", "Retard (jours)", "Tuteur", "Téléphone", "Dernière relance"],
        lignes: toutes.map((s) => [s.eleve.matricule, `${s.eleve.nom} ${s.eleve.prenom}`, s.classe?.libelle ?? "", s.montantEchu, s.solde, s.retardJours, s.eleve.tuteur.nom, s.eleve.tuteur.telephone, s.derniereRelance?.slice(0, 10) ?? ""]),
      };
    },
  },
  "paiements-du-jour": {
    roles: ["comptable"],
    fichier: "caisse-du-jour",
    construire: () => ({
      entetes: ["Heure", "Reçu", "Élève", "Classe", "Mode", "Référence", "Montant (FCFA)"],
      lignes: fin.caisseDuJour().paiements.map((p) => [p.date.slice(11, 16), p.numeroRecu, `${p.eleve.nom} ${p.eleve.prenom}`, p.classe.libelle, p.mode, p.reference, p.montant]),
    }),
  },
  paiements: {
    roles: ["comptable", "direction"],
    fichier: "paiements",
    construire: () => {
      const d = db();
      return {
        entetes: ["Date", "Reçu", "Matricule", "Élève", "Mode", "Référence", "Montant (FCFA)", "Statut", "Encaissé par"],
        lignes: [...d.paiements].sort((a, b) => a.date.localeCompare(b.date)).map((p) => {
          const e = d.eleves.find((x) => x.id === p.eleveId)!;
          return [p.date.replace("T", " ").slice(0, 16), p.numeroRecu, e.matricule, `${e.nom} ${e.prenom}`, p.mode, p.reference, p.montant, p.statut, p.encaissePar];
        }),
      };
    },
  },
  "rapport-financier": {
    roles: ["comptable", "direction"],
    fichier: "rapport-financier",
    construire: () => {
      const r = fin.rapportFinancier();
      return {
        entetes: ["Indicateur", "Valeur (FCFA)"],
        lignes: [
          ["Frais attendus", r.attendu],
          ["Frais encaissés", r.encaisse],
          ["Reste à encaisser", r.reste],
          ["Remises accordées", r.remises],
          ...r.mois.map((m): [string, number] => [`Encaissements ${m.mois}`, m.montant]),
          ...r.parMode.map((m): [string, number] => [`Mode ${m.mode}`, m.montant]),
        ],
      };
    },
  },
};

function versCsv({ entetes, lignes }: Table) {
  const cellule = (v: string | number) => {
    const s = String(v ?? "");
    return /[;"\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "﻿" + [entetes, ...lignes].map((l) => l.map(cellule).join(";")).join("\r\n");
}

export async function GET(request: Request, ctx: RouteContext<"/api/exports/[type]">) {
  const { type } = await ctx.params;
  const session = await getSession();
  if (!session) return new Response("Non authentifié / Unauthenticated", { status: 401 });
  const def = EXPORTS[type];
  if (!def) return new Response("Export inconnu / Unknown export", { status: 404 });
  if (!def.roles.includes(session.role)) return new Response("Accès refusé / Access denied", { status: 403 });

  const params = new URL(request.url).searchParams;
  const date = new Date().toISOString().slice(0, 10);
  const contenu = USE_MOCK ? versCsv(def.construire(params)) : await apiFetch<string>(`/exports/${type}`, { query: Object.fromEntries(params) });
  return new Response(contenu, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${def.fichier}-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
