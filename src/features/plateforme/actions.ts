"use server";
// Super-admin : création d'un établissement avec son année scolaire et son directeur (CU-SAD-01).
import { redirect } from "next/navigation";
import * as b from "@/lib/api/backend";
import { messageErreur } from "@/lib/api/errors";
import { exigerRole } from "@/lib/auth/dal";
import { getLangAction, getTAction } from "@/lib/i18n/server";
import { echec, type EtatFormulaire } from "@/lib/actions";

const v = (fd: FormData, k: string) => String(fd.get(k) ?? "").trim();

export async function creerEtablissement(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  await exigerRole("super_admin");
  const t = await getTAction();
  const lang = await getLangAction();
  const etab = {
    nom: v(fd, "nom"),
    code: v(fd, "code").toUpperCase(),
    type: v(fd, "type"),
    sousSysteme: v(fd, "sousSysteme"),
    ordreEnseignement: v(fd, "ordreEnseignement"),
    region: v(fd, "region") || null,
    departement: v(fd, "departement") || null,
    ville: v(fd, "ville") || null,
    adresse: v(fd, "adresse") || null,
    telephone: v(fd, "telephone") || null,
    email: v(fd, "email") || null,
  };
  const directeur = {
    prenom: v(fd, "dirPrenom"),
    nom: v(fd, "dirNom"),
    telephone: v(fd, "dirTelephone") ? b.normaliserIdentifiant(v(fd, "dirTelephone")) : null,
    email: v(fd, "dirEmail") || null,
    motDePasse: v(fd, "dirMotDePasse") || null,
    role: "DIRECTION",
  };
  const annee = { libelle: v(fd, "anneeLibelle"), dateDebut: v(fd, "anneeDebut"), dateFin: v(fd, "anneeFin"), courante: true };
  const erreurs: Record<string, string> = {};
  if (!etab.nom) erreurs.nom = t("Obligatoire.", "Required.");
  if (!/^[A-Z0-9_-]+$/.test(etab.code)) erreurs.code = t("Lettres, chiffres, tiret ou souligné.", "Letters, digits, dash or underscore.");
  if (!directeur.prenom || !directeur.nom || !directeur.email) erreurs.dirEmail = t("Prénom, nom et adresse e-mail du directeur obligatoires (connexion au web).", "Principal's first name, last name and email required (web sign-in).");
  if (!directeur.motDePasse || directeur.motDePasse.length < 8) erreurs.dirMotDePasse = t("8 caractères minimum.", "At least 8 characters.");
  if (!annee.libelle || !annee.dateDebut || !annee.dateFin) erreurs.anneeLibelle = t("Année scolaire obligatoire.", "School year required.");
  if (Object.keys(erreurs).length) return echec(t("Vérifiez les champs signalés.", "Please check the highlighted fields."), erreurs);

  let id: string;
  try {
    id = (await b.creerEtablissement(etab)).id;
    await b.creerAnnee(annee, id);
    await b.ajouterMembre(directeur, id);
  } catch (e) {
    return echec(messageErreur(e, lang));
  }
  redirect(`/${lang}/plateforme/etablissements/${id}`);
}
