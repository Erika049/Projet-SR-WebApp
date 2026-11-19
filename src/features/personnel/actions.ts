"use server";
// CU-DIR-03 / CU-SEC-09 : gérer le personnel, ses affectations et son compte.
import { refresh } from "next/cache";
import { ecrire } from "@/lib/api/client";
import { messageErreur } from "@/lib/api/errors";
import { exigerRole } from "@/lib/auth/dal";
import { getLangAction, getTAction } from "@/lib/i18n/server";
import { echec, erreursZod, lireFormulaire, type EtatFormulaire } from "@/lib/actions";
import * as m from "@/lib/api/mock/personnel";
import type { Personnel } from "@/types/domain";
import { schemaMembre } from "./schemas";

export async function ajouterMembre(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("direction");
  const t = await getTAction();
  const res = schemaMembre.safeParse(lireFormulaire(fd));
  if (!res.success) return echec(t("Vérifiez les champs signalés.", "Please check the highlighted fields."), erreursZod(res.error));
  try {
    const r = await ecrire(() => m.ajouterMembre(res.data, s.nomAffiche), "/personnel", "POST", res.data);
    refresh();
    return {
      ok: true,
      message: t(`Membre enregistré (${r.matricule}).`, `Staff member saved (${r.matricule}).`) + (res.data.creerCompte ? t(" Invitation envoyée par courriel et SMS.", " Invitation sent by email and SMS.") : ""),
      donnees: r,
    };
  } catch (e) {
    return echec(messageErreur(e, await getLangAction()));
  }
}

export async function changerStatut(id: string, statut: Personnel["statut"], fd?: FormData) {
  const s = await exigerRole("direction");
  const jusquau = fd ? String(fd.get("jusquau") ?? "") || undefined : undefined;
  await ecrire(() => m.changerStatut(id, statut, s.nomAffiche, jusquau), `/personnel/${id}/statut`, "PUT", { statut, jusquau });
  refresh();
}

export async function renvoyerInvitation(id: string) {
  const s = await exigerRole("direction");
  await ecrire(() => m.renvoyerInvitation(id, s.nomAffiche), `/personnel/${id}/invitation`, "POST");
  refresh();
}

export async function modifierAffectations(id: string, _: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("direction");
  const t = await getTAction();
  const classes = fd.getAll("classeId").map(String);
  const heures = fd.getAll("heures").map((h) => Number(h) || 0);
  const matiere = String(fd.get("matiere") ?? "");
  const affectations = classes.map((classeId, i) => ({ classeId, matiere, heures: heures[i] ?? 0 })).filter((a) => a.classeId && a.heures > 0);
  await ecrire(() => m.modifierAffectations(id, affectations, s.nomAffiche), `/personnel/${id}/affectations`, "PUT", affectations);
  refresh();
  return { ok: true, message: t("Affectations enregistrées.", "Assignments saved.") };
}
