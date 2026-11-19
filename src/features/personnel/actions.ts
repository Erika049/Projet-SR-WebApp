"use server";
// Direction : personnel (création de compte ou ajout de rôle) et affectations des enseignants (CU-DIR-03, CU-ENS-02).
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import * as b from "@/lib/api/backend";
import { messageErreur } from "@/lib/api/errors";
import { exigerRole } from "@/lib/auth/dal";
import { getLangAction, getTAction } from "@/lib/i18n/server";
import { echec, type EtatFormulaire } from "@/lib/actions";

const ROLES = ["DIRECTION", "SECRETARIAT", "SURVEILLANT", "ECONOMAT", "ENSEIGNANT"];

/** [etabId] : établissement visé par le super-admin ; sinon celui de la session (direction). */
export async function ajouterMembre(etabId: string | null, _: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("direction", "super_admin");
  const t = await getTAction();
  const lang = await getLangAction();
  const v = (k: string) => String(fd.get(k) ?? "").trim();
  const donnees = {
    prenom: v("prenom"),
    nom: v("nom"),
    telephone: v("telephone") ? b.normaliserIdentifiant(v("telephone")) : null,
    email: v("email") || null,
    motDePasse: v("motDePasse") || null,
    role: v("role"),
  };
  const erreurs: Record<string, string> = {};
  if (!donnees.prenom) erreurs.prenom = t("Obligatoire.", "Required.");
  if (!donnees.nom) erreurs.nom = t("Obligatoire.", "Required.");
  // Enseignants : application mobile, connexion par téléphone. Autres rôles : application web, connexion par e-mail.
  if (donnees.role === "ENSEIGNANT" && !donnees.telephone) {
    erreurs.telephone = t("Téléphone obligatoire pour un enseignant (connexion à l'application mobile).", "Phone required for a teacher (mobile app sign-in).");
  }
  if (donnees.role !== "ENSEIGNANT" && !donnees.email) {
    erreurs.email = t("Adresse e-mail obligatoire (connexion à l'application web).", "Email required (web app sign-in).");
  }
  if (!ROLES.includes(donnees.role)) erreurs.role = t("Choisissez un rôle.", "Choose a role.");
  if (donnees.motDePasse && donnees.motDePasse.length < 8) erreurs.motDePasse = t("8 caractères minimum.", "At least 8 characters.");
  if (Object.keys(erreurs).length) return echec(t("Vérifiez les champs signalés.", "Please check the highlighted fields."), erreurs);
  const cible = s.role === "super_admin" ? etabId : null;
  try {
    await b.ajouterMembre(donnees, cible ?? undefined);
  } catch (e) {
    return echec(messageErreur(e, lang));
  }
  if (cible) {
    refresh();
    return { ok: true, message: t("Compte créé : communiquez le mot de passe initial à son titulaire.", "Account created: give the initial password to its holder.") };
  }
  redirect(`/${lang}/direction/personnel`);
}

export async function creerAffectation(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  await exigerRole("direction");
  const t = await getTAction();
  const data = { classeId: String(fd.get("classeId") ?? ""), matiereId: String(fd.get("matiereId") ?? ""), enseignantId: String(fd.get("enseignantId") ?? "") };
  if (!data.classeId || !data.matiereId || !data.enseignantId) return echec(t("Choisissez l'enseignant, la classe et la matière.", "Choose the teacher, class and subject."));
  try {
    await b.creerAffectation(data);
    refresh();
    return { ok: true, message: t("Affectation enregistrée.", "Assignment saved.") };
  } catch (e) {
    return echec(messageErreur(e, await getLangAction()));
  }
}
