"use server";
// Direction : paramétrage de l'année (périodes, classes, matières, frais, emploi du temps) — CU-DIR-02, CU-DIR-04.
import { refresh } from "next/cache";
import * as b from "@/lib/api/backend";
import { messageErreur } from "@/lib/api/errors";
import { exigerRole } from "@/lib/auth/dal";
import { getLangAction, getTAction } from "@/lib/i18n/server";
import { echec, type EtatFormulaire } from "@/lib/actions";

const v = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();
const DATE = /^\d{4}-\d{2}-\d{2}$/;

async function executer(operation: () => Promise<unknown>, succes: string): Promise<EtatFormulaire> {
  try {
    await operation();
    refresh();
    return { ok: true, message: succes };
  } catch (e) {
    return echec(messageErreur(e, await getLangAction()));
  }
}

export async function creerAnnee(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  await exigerRole("direction");
  const t = await getTAction();
  const data = { libelle: v(fd, "libelle"), dateDebut: v(fd, "dateDebut"), dateFin: v(fd, "dateFin"), courante: fd.get("courante") === "on" };
  if (!data.libelle || !DATE.test(data.dateDebut) || !DATE.test(data.dateFin)) return echec(t("Libellé et dates obligatoires.", "Label and dates required."));
  return executer(() => b.creerAnnee(data), t("Année scolaire créée.", "School year created."));
}

export async function creerPeriode(anneeId: string, _: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  await exigerRole("direction");
  const t = await getTAction();
  const data = { type: v(fd, "type"), numero: Number(v(fd, "numero")), dateDebut: v(fd, "dateDebut"), dateFin: v(fd, "dateFin") };
  if (!["SEQUENCE", "TRIMESTRE"].includes(data.type) || !(data.numero >= 1) || !DATE.test(data.dateDebut) || !DATE.test(data.dateFin)) {
    return echec(t("Type, numéro et dates obligatoires.", "Type, number and dates required."));
  }
  return executer(() => b.creerPeriode(anneeId, data), t("Période créée.", "Period created."));
}

export async function basculerSaisie(anneeId: string, periodeId: string, ouvrir: boolean) {
  await exigerRole("direction");
  await b.basculerSaisie(anneeId, periodeId, ouvrir);
  refresh();
}

export async function creerClasse(anneeId: string, _: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  await exigerRole("direction", "secretariat");
  const t = await getTAction();
  const max = Number(v(fd, "effectifMax"));
  const data = { anneeScolaireId: anneeId, nom: v(fd, "nom"), niveau: v(fd, "niveau"), effectifMax: max > 0 ? max : null };
  if (!data.nom || !data.niveau) return echec(t("Nom et niveau obligatoires.", "Name and level required."));
  return executer(() => b.creerClasse(data), t(`Classe ${data.nom} créée.`, `Class ${data.nom} created.`));
}

export async function creerMatiere(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  await exigerRole("direction");
  const t = await getTAction();
  const data = { nom: v(fd, "nom"), code: v(fd, "code").toUpperCase(), coefficientDefaut: Number(v(fd, "coefficient").replace(",", ".")) };
  if (!data.nom || !data.code || !(data.coefficientDefaut > 0)) return echec(t("Nom, code et coefficient obligatoires.", "Name, code and coefficient required."));
  return executer(() => b.creerMatiere(data), t(`Matière ${data.nom} créée.`, `Subject ${data.nom} created.`));
}

export async function creerFrais(anneeId: string, _: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  await exigerRole("direction");
  const t = await getTAction();
  const data = { niveau: v(fd, "niveau"), libelle: v(fd, "libelle"), montant: Number(v(fd, "montant").replace(/\s/g, "")), dateEcheance: v(fd, "dateEcheance") };
  if (!data.niveau || !data.libelle || !(data.montant >= 0) || !DATE.test(data.dateEcheance)) {
    return echec(t("Niveau, libellé, montant et échéance obligatoires.", "Level, label, amount and due date required."));
  }
  return executer(() => b.creerFrais(anneeId, data), t("Frais enregistrés.", "Fee saved."));
}

export async function creerCreneau(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  await exigerRole("direction");
  const t = await getTAction();
  const data = {
    classeId: v(fd, "classeId"),
    matiereId: v(fd, "matiereId"),
    jourSemaine: Number(v(fd, "jourSemaine")),
    heureDebut: v(fd, "heureDebut"),
    heureFin: v(fd, "heureFin"),
    salle: v(fd, "salle") || null,
  };
  if (!data.classeId || !data.matiereId || !(data.jourSemaine >= 1 && data.jourSemaine <= 6) || !data.heureDebut || !data.heureFin) {
    return echec(t("Classe, matière, jour et heures obligatoires.", "Class, subject, day and times required."));
  }
  return executer(() => b.creerCreneau(data), t("Cours ajouté à l'emploi du temps.", "Lesson added to the timetable."));
}

export async function supprimerCreneau(id: string) {
  await exigerRole("direction");
  await b.supprimerCreneau(id);
  refresh();
}
