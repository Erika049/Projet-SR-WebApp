// Données d'exemple — présences des élèves, appels, justificatifs, retards et sorties anticipées.
import "server-only";
import type { StatutPresence } from "@/types/domain";
import { ErreurMetier } from "../errors";
import { aujourdhui, db, jour, journaliser, maintenant, nouvelId, notifier, ECOLE_ID } from "./db";
import { enrichir } from "./scolarite";

export function presencesDuJour() {
  const d = db();
  const date = aujourdhui();
  let presents = 0;
  let total = 0;
  let absences = 0;
  let retards = 0;
  const parClasse = d.classes.map((c) => {
    const appel = d.appels.find((a) => a.classeId === c.id && a.date === date);
    if (!appel) return { classe: c, taux: null as number | null, absents: 0, retards: 0, appelFait: false };
    const statuts = Object.values(appel.statuts);
    const p = statuts.filter((s) => s !== "absent").length;
    const a = statuts.length - p;
    const r = statuts.filter((s) => s === "retard").length;
    presents += p;
    total += statuts.length;
    absences += a;
    retards += r;
    return { classe: c, taux: statuts.length ? Math.round((p / statuts.length) * 1000) / 10 : 100, absents: a, retards: r, appelFait: true };
  });
  const retardsSaisis = d.retardsSorties.filter((x) => x.date === date && x.type === "retard").length;
  const taux = total ? Math.round((presents / total) * 1000) / 10 : 0;
  return {
    date,
    taux,
    absences,
    retards: retards + retardsSaisis,
    aJustifier: d.justificatifs.filter((j) => j.statut === "en_attente").length,
    parClasse,
    appelsManquants: parClasse.filter((c) => !c.appelFait).map((c) => c.classe),
    semaine: [...d.tauxSemaine, taux].map((v, i, arr) => ({ date: jour(i - (arr.length - 1)), taux: v })),
  };
}

export function appelClasse(classeId: string) {
  const d = db();
  const c = d.classes.find((x) => x.id === classeId);
  if (!c) return null;
  const appel = d.appels.find((a) => a.classeId === classeId && a.date === aujourdhui());
  const eleves = d.eleves.filter((e) => e.classeId === classeId && e.statut === "actif").sort((a, b) => a.nom.localeCompare(b.nom));
  return { classe: c, appel, eleves: eleves.map((e) => ({ eleve: e, statut: (appel?.statuts[e.id] ?? "present") as StatutPresence })) };
}

export function enregistrerAppel(classeId: string, statuts: Record<string, StatutPresence>, acteur: string) {
  const d = db();
  const c = d.classes.find((x) => x.id === classeId);
  if (!c) throw new ErreurMetier("Classe introuvable.", "Class not found.");
  const date = aujourdhui();
  const existant = d.appels.find((a) => a.classeId === classeId && a.date === date);
  const anciens = existant?.statuts ?? {};
  if (existant) {
    existant.statuts = statuts;
    existant.realisePar = acteur;
  } else d.appels.push({ id: nouvelId("apl"), classeId, date, realisePar: acteur, statuts });
  // Notification des parents pour chaque nouvelle absence ou retard (CU-SYS-01)
  const nouveaux = Object.entries(statuts).filter(([id, s]) => s !== "present" && anciens[id] !== s).length;
  journaliser(ECOLE_ID, acteur, existant ? "Appel corrigé" : "Appel saisi", `${c.libelle} · ${nouveaux} parent(s) notifié(s)`);
  return { notifies: nouveaux };
}

export function relancerAppel(classeId: string, acteur: string) {
  const c = db().classes.find((x) => x.id === classeId);
  if (!c) throw new ErreurMetier("Classe introuvable.", "Class not found.");
  journaliser(ECOLE_ID, acteur, "Relance d'appel envoyée", c.libelle);
}

// ---------- Justificatifs ----------
export function listerJustificatifs(statut: "en_attente" | "traites") {
  const d = db();
  return d.justificatifs
    .filter((j) => (statut === "en_attente" ? j.statut === "en_attente" : j.statut !== "en_attente"))
    .sort((a, b) => b.soumisLe.localeCompare(a.soumisLe))
    .map((j) => ({ ...j, eleve: enrichir(d.eleves.find((e) => e.id === j.eleveId)!) }));
}

export function traiterJustificatif(id: string, decision: "accepte" | "refuse", acteur: string) {
  const d = db();
  const j = d.justificatifs.find((x) => x.id === id);
  if (!j) throw new ErreurMetier("Justificatif introuvable.", "Absence note not found.");
  if (j.statut !== "en_attente") throw new ErreurMetier("Ce justificatif a déjà été traité.", "This note has already been processed.");
  j.statut = decision;
  j.traitePar = acteur;
  const e = d.eleves.find((x) => x.id === j.eleveId)!;
  journaliser(ECOLE_ID, acteur, decision === "accepte" ? "Justificatif validé" : "Justificatif refusé", `${e.prenom} ${e.nom}`);
}

// ---------- Retards et sorties ----------
export function listerRetardsSorties(date = aujourdhui()) {
  const d = db();
  return d.retardsSorties
    .filter((r) => r.date === date)
    .sort((a, b) => a.heure.localeCompare(b.heure))
    .map((r) => ({ ...r, eleve: enrichir(d.eleves.find((e) => e.id === r.eleveId)!) }));
}

export function retardsRepetes() {
  const d = db();
  const depuis = jour(-7);
  const parEleve = new Map<string, number>();
  for (const r of d.retardsSorties) if (r.type === "retard" && r.date >= depuis) parEleve.set(r.eleveId, (parEleve.get(r.eleveId) ?? 0) + 1);
  return [...parEleve.entries()].filter(([, n]) => n >= 3).map(([id, n]) => ({ eleve: enrichir(d.eleves.find((e) => e.id === id)!), nombre: n }));
}

export function enregistrerRetardSortie(data: { eleveId: string; type: "retard" | "sortie"; heure: string; motif: string }, acteur: string) {
  const d = db();
  const e = d.eleves.find((x) => x.id === data.eleveId);
  if (!e) throw new ErreurMetier("Élève introuvable.", "Student not found.");
  d.retardsSorties.push({ id: nouvelId("rs"), date: aujourdhui(), ...data });
  journaliser(ECOLE_ID, acteur, data.type === "retard" ? "Retard enregistré" : "Sortie anticipée enregistrée", `${e.prenom} ${e.nom} · ${data.heure}`);
  const n = retardsRepetes().find((r) => r.eleve.id === e.id);
  if (n && data.type === "retard") notifier("surveillant", "retard", "Retards répétés", `${e.prenom} ${e.nom} : ${n.nombre} retards cette semaine`, "/surveillance/retards-sorties");
  return { parentNotifie: true, horodatage: maintenant() };
}
