// Données d'exemple — avancement de la saisie des notes, validation et publication des bulletins.
// Les moyennes et rangs sont calculés par l'API (CU-SYS-02) ; ici ils sont simulés de façon déterministe.
import "server-only";
import type { BulletinClasse, LigneBulletin, StatutBulletin } from "@/types/domain";
import { ErreurMetier } from "../errors";
import { db, journaliser, notifier, ECOLE_ID } from "./db";

const ORDRE: StatutBulletin[] = ["incomplet", "a_valider", "valide", "publie"];

export function suiviBulletins(vue: "sequence" | "trimestre", numero: number) {
  const d = db();
  const lignes = d.classes.map((c) => {
    let b: Pick<BulletinClasse, "progression" | "statut">;
    if (vue === "sequence") {
      b = d.bulletins.find((x) => x.classeId === c.id && x.sequence === numero) ?? { progression: 0, statut: "incomplet" };
    } else {
      const seqs = d.bulletins.filter((x) => x.classeId === c.id && Math.ceil(x.sequence / 2) === numero);
      const progression = seqs.length === 2 ? Math.round((seqs[0].progression + seqs[1].progression) / 2) : 0;
      const statut = seqs.length === 2 ? ORDRE[Math.min(...seqs.map((s) => ORDRE.indexOf(s.statut)))] : "incomplet";
      b = { progression, statut };
    }
    return { classe: c, ...b };
  });
  const totalSaisi = Math.round(lignes.reduce((s, l) => s + l.progression, 0) / Math.max(1, lignes.length));
  const sequence = d.sequences.find((s) => s.numero === (vue === "sequence" ? numero : numero * 2 - 1));
  return {
    lignes,
    progression: totalSaisi,
    validesOuPublies: lignes.filter((l) => l.statut === "valide" || l.statut === "publie").length,
    aValider: lignes.filter((l) => l.statut === "a_valider").length,
    incomplets: lignes.filter((l) => l.statut === "incomplet").length,
    sequence,
  };
}

function bulletin(classeId: string, sequence: number) {
  const b = db().bulletins.find((x) => x.classeId === classeId && x.sequence === sequence);
  if (!b) throw new ErreurMetier("Bulletins introuvables.", "Report cards not found.");
  return b;
}

export function validerBulletins(classeIds: string[], sequence: number, acteur: string) {
  const d = db();
  let n = 0;
  for (const id of classeIds) {
    const b = bulletin(id, sequence);
    if (b.statut === "a_valider") {
      b.statut = "valide";
      n++;
    }
  }
  if (n) journaliser(ECOLE_ID, acteur, "Bulletins validés", `${n} classe(s) · Séquence ${sequence}`);
  return { n, classes: classeIds.map((id) => d.classes.find((c) => c.id === id)?.libelle) };
}

export function publierBulletins(classeIds: string[], sequence: number, acteur: string) {
  const d = db();
  let n = 0;
  for (const id of classeIds) {
    const b = bulletin(id, sequence);
    if (b.statut === "a_valider" || b.statut === "valide") {
      b.statut = "publie";
      n++;
      journaliser(ECOLE_ID, acteur, "Bulletins publiés", `${d.classes.find((c) => c.id === id)?.libelle} · Séquence ${sequence}`);
    }
  }
  if (!n) throw new ErreurMetier("Aucune classe prête à être publiée.", "No class is ready to be published.");
  return { n };
}

export function genererBulletins(sequence: number, acteur: string) {
  const d = db();
  let n = 0;
  for (const b of d.bulletins.filter((x) => x.sequence === sequence && x.progression === 100 && x.statut === "incomplet")) {
    b.statut = "a_valider";
    n++;
  }
  journaliser(ECOLE_ID, acteur, "Bulletins générés", `Séquence ${sequence} · ${n} classe(s)`);
  return { n };
}

export function cloturerSaisie(sequence: number, acteur: string) {
  const s = db().sequences.find((x) => x.numero === sequence);
  if (!s) throw new ErreurMetier("Séquence introuvable.", "Sequence not found.");
  s.statut = "cloturee";
  s.saisieJusquau = null;
  journaliser(ECOLE_ID, acteur, "Saisie des notes clôturée", `Séquence ${sequence}`);
}

export function relancerEnseignants(classeId: string, acteur: string) {
  const c = db().classes.find((x) => x.id === classeId);
  if (!c) throw new ErreurMetier("Classe introuvable.", "Class not found.");
  notifier("direction", "bulletin", "Relance envoyée", `Les enseignants de ${c.libelle} ont été relancés`);
  journaliser(ECOLE_ID, acteur, "Relance de saisie des notes", c.libelle);
}

/** Aperçu du bulletin d'une classe : moyennes par matière, moyenne générale, rang. */
export function apercuBulletins(classeId: string, sequence: number) {
  const d = db();
  const c = d.classes.find((x) => x.id === classeId);
  if (!c) return null;
  const matieres = d.matieres
    .map((m) => ({ libelle: m.libelle, coefficient: c.cycle === "premier" ? m.coefficientPremierCycle : m.coefficientSecondCycle }))
    .filter((m) => m.coefficient > 0);
  const hash = (s: string) => [...s].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) >>> 0, 7);
  const eleves = d.eleves.filter((e) => e.classeId === classeId && e.statut === "actif");
  const lignes: LigneBulletin[] = eleves.map((e) => {
    const base = 7 + (hash(e.id) % 900) / 100; // niveau de l'élève entre 7 et 16
    const moyennes = matieres.map((m) => ({
      matiere: m.libelle,
      coefficient: m.coefficient,
      moyenne: Math.max(2, Math.min(19.5, Math.round((base + ((hash(e.id + m.libelle + sequence) % 600) - 300) / 100) * 100) / 100)),
    }));
    const totalCoef = moyennes.reduce((s, m) => s + m.coefficient, 0);
    const mg = Math.round((moyennes.reduce((s, m) => s + m.moyenne * m.coefficient, 0) / totalCoef) * 100) / 100;
    return { eleveId: e.id, nom: `${e.nom} ${e.prenom}`, moyennes, moyenneGenerale: mg, rang: 0, appreciation: "" };
  });
  lignes.sort((a, b) => b.moyenneGenerale - a.moyenneGenerale);
  const ev = d.evaluation;
  lignes.forEach((l, i) => {
    l.rang = i + 1;
    l.appreciation =
      l.moyenneGenerale >= 16 ? "Excellent travail" : l.moyenneGenerale >= ev.seuilTableauHonneur ? "Tableau d'honneur" : l.moyenneGenerale >= ev.seuilReussite ? "Passable, peut mieux faire" : l.moyenneGenerale >= ev.seuilAvertissement ? "Insuffisant" : "Avertissement travail";
  });
  const mgs = lignes.map((l) => l.moyenneGenerale);
  return {
    classe: c,
    matieres,
    lignes,
    statut: d.bulletins.find((b) => b.classeId === classeId && b.sequence === sequence)?.statut ?? "incomplet",
    stats: {
      moyenneClasse: mgs.length ? Math.round((mgs.reduce((s, v) => s + v, 0) / mgs.length) * 100) / 100 : 0,
      premier: mgs[0] ?? 0,
      dernier: mgs.at(-1) ?? 0,
      reussite: mgs.length ? Math.round((mgs.filter((v) => v >= ev.seuilReussite).length / mgs.length) * 100) : 0,
    },
  };
}
