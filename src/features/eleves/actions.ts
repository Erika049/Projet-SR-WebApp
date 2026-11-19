"use server";
// Secrétariat : inscription d'un élève, affectation en classe, tuteurs et codes de liaison (CU-SEC-01/03/04/05).
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import * as b from "@/lib/api/backend";
import { messageErreur } from "@/lib/api/errors";
import { exigerRole } from "@/lib/auth/dal";
import { getLangAction, getTAction } from "@/lib/i18n/server";
import { echec, type EtatFormulaire } from "@/lib/actions";

const texte = (fd: FormData, cle: string) => String(fd.get(cle) ?? "").trim();

export async function inscrireEleve(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  await exigerRole("secretariat", "direction");
  const t = await getTAction();
  const lang = await getLangAction();
  const erreurs: Record<string, string> = {};
  const donnees = {
    nom: texte(fd, "nom"),
    prenom: texte(fd, "prenom"),
    sexe: texte(fd, "sexe"),
    dateNaissance: texte(fd, "dateNaissance"),
    lieuNaissance: texte(fd, "lieuNaissance") || null,
    nationalite: texte(fd, "nationalite") || null,
    classeId: texte(fd, "classeId") || null,
    matricule: texte(fd, "matricule"),
    type: texte(fd, "type") || "NOUVEAU",
    redoublant: fd.get("redoublant") === "on",
  };
  if (!donnees.nom) erreurs.nom = t("Obligatoire.", "Required.");
  if (!donnees.prenom) erreurs.prenom = t("Obligatoire.", "Required.");
  if (donnees.sexe !== "M" && donnees.sexe !== "F") erreurs.sexe = t("Choisissez.", "Choose.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(donnees.dateNaissance)) erreurs.dateNaissance = t("Date invalide.", "Invalid date.");
  if (!donnees.matricule) erreurs.matricule = t("Obligatoire.", "Required.");
  const tuteur = {
    prenom: texte(fd, "tuteurPrenom"),
    nom: texte(fd, "tuteurNom"),
    telephone: texte(fd, "tuteurTelephone") || null,
    email: null,
    lien: texte(fd, "tuteurLien") || "AUTRE",
    peutPayer: true,
    peutJustifier: true,
  };
  const avecTuteur = Boolean(tuteur.prenom || tuteur.nom || tuteur.telephone);
  if (avecTuteur && (!tuteur.prenom || !tuteur.nom || !tuteur.telephone)) {
    erreurs.tuteurTelephone = t("Prénom, nom et téléphone du tuteur sont nécessaires.", "Guardian first name, last name and phone are required.");
  }
  if (Object.keys(erreurs).length) return echec(t("Vérifiez les champs signalés.", "Please check the highlighted fields."), erreurs);

  let eleveId: string;
  try {
    const annee = await b.anneeCourante();
    if (!annee) return echec(t("Aucune année scolaire courante n'est définie (Paramétrage).", "No current school year is set (Settings)."));
    eleveId = (await b.inscrire({ ...donnees, anneeScolaireId: annee.id })).eleveId;
    if (avecTuteur) await b.enregistrerTuteur(eleveId, tuteur);
  } catch (e) {
    return echec(messageErreur(e, lang));
  }
  redirect(`/${lang}/secretariat/eleves/${eleveId}?inscrit=1`);
}

export async function affecterClasse(eleveId: string, _: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  await exigerRole("secretariat", "direction");
  const t = await getTAction();
  const classeId = texte(fd, "classeId");
  if (!classeId) return echec(t("Choisissez une classe.", "Choose a class."));
  try {
    await b.affecterClasse(eleveId, classeId);
    refresh();
    return { ok: true, message: t("Classe mise à jour.", "Class updated.") };
  } catch (e) {
    return echec(messageErreur(e, await getLangAction()));
  }
}

/** Tuteur avec un compte : lien direct. Sans compte : un code de liaison est généré pour l'application mobile. */
export async function ajouterTuteur(eleveId: string, _: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  await exigerRole("secretariat", "direction");
  const t = await getTAction();
  const tuteur = {
    prenom: texte(fd, "prenom"),
    nom: texte(fd, "nom"),
    telephone: texte(fd, "telephone") || null,
    email: texte(fd, "email") || null,
    lien: texte(fd, "lien") || "AUTRE",
    peutPayer: fd.get("peutPayer") === "on",
    peutJustifier: fd.get("peutJustifier") === "on",
  };
  if (!tuteur.prenom || !tuteur.nom || (!tuteur.telephone && !tuteur.email)) {
    return echec(t("Prénom, nom et téléphone (ou courriel) sont obligatoires.", "First name, last name and phone (or email) are required."));
  }
  try {
    const r = await b.enregistrerTuteur(eleveId, tuteur);
    refresh();
    return r.code
      ? {
          ok: true,
          message: t(
            `Le tuteur n'a pas encore de compte : remettez-lui le code de liaison ${r.code.code} (à saisir dans l'application mobile).`,
            `The guardian has no account yet: give them the link code ${r.code.code} (to enter in the mobile app).`,
          ),
          donnees: { code: r.code.code },
        }
      : { ok: true, message: t("Le tuteur avait déjà un compte : il est lié à l'élève.", "The guardian already had an account: they are linked to the student.") };
  } catch (e) {
    return echec(messageErreur(e, await getLangAction()));
  }
}

export async function traiterLiaison(id: string, eleveId: string, decision: "accepter" | "refuser") {
  await exigerRole("secretariat", "direction");
  await b.traiterLiaison(id, eleveId, decision);
  refresh();
}
