"use server";
// CU-DIR-02 : paramétrer l'année scolaire, les périodes, les classes, les matières, le calendrier, l'évaluation.
import { refresh } from "next/cache";
import { ecrire } from "@/lib/api/client";
import { messageErreur } from "@/lib/api/errors";
import { exigerRole } from "@/lib/auth/dal";
import { getLangAction, getTAction } from "@/lib/i18n/server";
import { echec, erreursZod, lireFormulaire, type EtatFormulaire } from "@/lib/actions";
import * as m from "@/lib/api/mock/scolarite";
import type { Sequence, Trimestre } from "@/types/domain";
import { schemaAnnee, schemaClasse, schemaEvaluation, schemaEvenement, schemaMatiere, schemaPeriode } from "./schemas";

async function executer<T>(fn: () => Promise<T>, succes: [string, string]): Promise<EtatFormulaire> {
  const t = await getTAction();
  try {
    await fn();
    refresh();
    return { ok: true, message: t(...succes) };
  } catch (e) {
    return echec(messageErreur(e, await getLangAction()));
  }
}

const invalide = async (erreurs: Record<string, string>) => echec((await getTAction())("Vérifiez les champs signalés.", "Please check the highlighted fields."), erreurs);

export async function enregistrerAnnee(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("direction");
  const res = schemaAnnee.safeParse(lireFormulaire(fd));
  if (!res.success) return invalide(erreursZod(res.error));
  return executer(() => ecrire(() => m.enregistrerAnnee(res.data, s.nomAffiche), "/parametrage/annee", "PUT", res.data), ["Année enregistrée.", "School year saved."]);
}

export async function modifierTrimestre(id: string, _: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("direction");
  const res = schemaPeriode.safeParse(lireFormulaire(fd));
  if (!res.success) return invalide(erreursZod(res.error));
  const data = { ...res.data, statut: res.data.statut as Trimestre["statut"] };
  return executer(() => ecrire(() => m.modifierTrimestre(id, data, s.nomAffiche), `/parametrage/trimestres/${id}`, "PUT", data), ["Période enregistrée.", "Term saved."]);
}

export async function modifierSequence(numero: number, _: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("direction");
  const v = lireFormulaire(fd) as Record<string, string>;
  const res = schemaPeriode.safeParse(v);
  if (!res.success) return invalide(erreursZod(res.error));
  const data = { debut: res.data.debut, fin: res.data.fin, statut: res.data.statut as Sequence["statut"], saisieJusquau: v.saisieJusquau || null };
  return executer(() => ecrire(() => m.modifierSequence(numero, data, s.nomAffiche), `/parametrage/sequences/${numero}`, "PUT", data), ["Séquence enregistrée.", "Sequence saved."]);
}

export async function creerClasse(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("direction");
  const res = schemaClasse.safeParse(lireFormulaire(fd));
  if (!res.success) return invalide(erreursZod(res.error));
  return executer(() => ecrire(() => m.creerClasse(res.data, s.nomAffiche), "/classes", "POST", res.data), ["Classe créée.", "Class created."]);
}

export async function modifierClasse(id: string, _: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("direction");
  const data = { capacite: Number(fd.get("capacite")) || 60, titulaireId: String(fd.get("titulaireId") ?? "") || null };
  return executer(() => ecrire(() => m.modifierClasse(id, data, s.nomAffiche), `/classes/${id}`, "PUT", data), ["Classe modifiée.", "Class updated."]);
}

export async function enregistrerMatiere(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("direction");
  const res = schemaMatiere.safeParse(lireFormulaire(fd));
  if (!res.success) return invalide(erreursZod(res.error));
  const data = { ...res.data, groupe: res.data.groupe as 1 | 2 | 3, id: res.data.id || undefined };
  return executer(() => ecrire(() => m.enregistrerMatiere(data, s.nomAffiche), "/matieres", "PUT", data), ["Matière enregistrée.", "Subject saved."]);
}

export async function ajouterEvenement(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("direction");
  const res = schemaEvenement.safeParse(lireFormulaire(fd));
  if (!res.success) return invalide(erreursZod(res.error));
  return executer(() => ecrire(() => m.ajouterEvenement(res.data, s.nomAffiche), "/calendrier", "POST", res.data), ["Événement ajouté.", "Event added."]);
}

export async function supprimerEvenement(id: string) {
  const s = await exigerRole("direction");
  await ecrire(() => m.supprimerEvenement(id, s.nomAffiche), `/calendrier/${id}`, "DELETE");
  refresh();
}

export async function enregistrerEvaluation(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("direction");
  const res = schemaEvaluation.safeParse(lireFormulaire(fd));
  if (!res.success) return invalide(erreursZod(res.error));
  return executer(() => ecrire(() => m.enregistrerEvaluation(res.data, s.nomAffiche), "/parametrage/evaluation", "PUT", res.data), ["Paramètres enregistrés.", "Settings saved."]);
}

export async function cloturerAnnee() {
  const s = await exigerRole("direction");
  await ecrire(() => m.cloturerAnnee(s.nomAffiche), "/parametrage/annee/cloturer", "POST");
  refresh();
}
