"use server";
// Actions super-admin : établissements, abonnements, comptes, support (CU-SAD-01..06).
import { refresh } from "next/cache";
import { ecrire } from "@/lib/api/client";
import { messageErreur } from "@/lib/api/errors";
import { exigerRole } from "@/lib/auth/dal";
import { getLangAction, getTAction } from "@/lib/i18n/server";
import { echec, erreursZod, lireFormulaire, type EtatFormulaire } from "@/lib/actions";
import * as m from "@/lib/api/mock/plateforme";
import { schemaEtablissementComplet, schemaEtapeAbonnement, schemaEtapeDirecteur, schemaEtapeEtablissement } from "./schemas";

const SCHEMAS_ETAPES = [schemaEtapeEtablissement, schemaEtapeDirecteur, schemaEtapeAbonnement];

/**
 * Assistant de création (4 étapes). Les valeurs déjà saisies voyagent dans des champs cachés ;
 * chaque étape est validée avant de passer à la suivante, la dernière crée l'établissement.
 */
export async function assistantEtablissement(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("super_admin");
  const t = await getTAction();
  const valeurs = lireFormulaire(fd) as Record<string, string>;
  const etape = Number(valeurs.etape ?? 1);
  const sens = valeurs.sens ?? "suivant";
  const conserver = Object.fromEntries(Object.entries(valeurs).filter(([k]) => !["etape", "sens"].includes(k)));

  if (sens === "retour") return { donnees: { ...conserver, etape: Math.max(1, etape - 1) } };

  const res = SCHEMAS_ETAPES[etape - 1].safeParse(valeurs);
  if (!res.success) return { ...echec(t("Vérifiez les champs signalés.", "Please check the highlighted fields."), erreursZod(res.error)), donnees: { ...conserver, etape } };
  if (etape < 3) return { donnees: { ...conserver, etape: etape + 1 } };

  const complet = schemaEtablissementComplet.safeParse(valeurs);
  if (!complet.success) return { ...echec(t("Des informations manquent.", "Some information is missing."), erreursZod(complet.error)), donnees: { ...conserver, etape: 1 } };
  try {
    const r = await ecrire(() => m.creerEtablissement(complet.data, s.nomAffiche), "/plateforme/etablissements", "POST", complet.data);
    refresh();
    return { ok: true, donnees: { ...conserver, ...r, etape: 4 } };
  } catch (e) {
    return { ...echec(messageErreur(e, await getLangAction())), donnees: { ...conserver, etape } };
  }
}

export async function changerStatutEtablissement(id: string, statut: "actif" | "suspendu") {
  const s = await exigerRole("super_admin");
  await ecrire(() => m.changerStatutEtablissement(id, statut, s.nomAffiche), `/plateforme/etablissements/${id}/statut`, "PUT", { statut });
  refresh();
}

export async function prolongerAbonnement(id: string, fd: FormData) {
  const s = await exigerRole("super_admin");
  const mois = Number(fd.get("mois") ?? 12) || 12;
  const plan = (fd.get("plan") as "standard" | "premium" | null) ?? undefined;
  await ecrire(() => m.prolongerAbonnement(id, mois, s.nomAffiche, plan || undefined), `/plateforme/etablissements/${id}/abonnement`, "POST", { mois, plan });
  refresh();
}

export async function repondreTicket(id: string, _: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("super_admin");
  const t = await getTAction();
  const texte = String(fd.get("texte") ?? "").trim();
  if (!texte) return echec(t("Le message est vide.", "The message is empty."));
  await ecrire(() => m.repondreTicket(id, texte, s.nomAffiche), `/plateforme/tickets/${id}/messages`, "POST", { texte });
  refresh();
  return { ok: true, message: t("Réponse envoyée.", "Reply sent.") };
}

export async function resoudreTicket(id: string) {
  const s = await exigerRole("super_admin");
  await ecrire(() => m.resoudreTicket(id, s.nomAffiche), `/plateforme/tickets/${id}/resoudre`, "POST");
  refresh();
}

export async function ouvrirAccesSupport(etablissementId: string) {
  const s = await exigerRole("super_admin");
  await ecrire(() => m.accesSupport(etablissementId, s.nomAffiche), `/plateforme/etablissements/${etablissementId}/acces-support`, "POST");
  refresh();
}

export async function actionCompte(userId: string, action: "reinitialiser" | "renvoyer" | "deverrouiller") {
  const s = await exigerRole("super_admin");
  await ecrire(() => m.actionCompte(userId, action, s.nomAffiche), `/plateforme/utilisateurs/${userId}/${action}`, "POST");
  refresh();
}
