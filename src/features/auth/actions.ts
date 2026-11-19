"use server";
// Authentification et compte (backend SchoolConnect) : connexion, déconnexion, mot de passe oublié, profil.
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { z } from "zod";
import * as b from "@/lib/api/backend";
import { messageErreur } from "@/lib/api/errors";
import { createSession, deleteSession, getSession } from "@/lib/auth/session";
import { accueilDuRole } from "@/lib/auth/roles";
import { getLangAction, getTAction } from "@/lib/i18n/server";
import { echec, type EtatFormulaire } from "@/lib/actions";
import type { Role } from "@/types/domain";

/** Rôles du backend → espaces web, par ordre de priorité si le compte en cumule plusieurs. */
const ROLES_BACKEND: [string, Role][] = [
  ["SUPER_ADMIN", "super_admin"],
  ["DIRECTION", "direction"],
  ["SURVEILLANT", "surveillant"],
  ["SECRETARIAT", "secretariat"],
  ["ECONOMAT", "comptable"],
];

/**
 * Connexion du personnel (POST /auth/login) : adresse e-mail et mot de passe.
 * Pas d'inscription sur le web : les comptes sont créés par la direction ou le super-admin.
 * (Les parents et enseignants se connectent sur l'application mobile avec leur téléphone.)
 */
export async function connexion(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const t = await getTAction();
  const lang = await getLangAction();
  const identifiant = String(fd.get("identifiant") ?? "").trim().toLowerCase();
  const motDePasse = String(fd.get("motDePasse") ?? "");
  if (!identifiant || !motDePasse) return echec(t("Saisissez votre adresse e-mail et votre mot de passe.", "Enter your email and password."));
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifiant)) {
    return echec(t("Connectez-vous avec votre adresse e-mail.", "Sign in with your email address."));
  }

  let session: Parameters<typeof createSession>[0];
  try {
    const { jeton, utilisateur: u } = await b.connexion(identifiant, motDePasse);
    const trouve = ROLES_BACKEND.map(([api, web]) => ({ web, r: u.roles.find((x) => x.role === api) })).find((x) => x.r);
    if (!trouve) {
      return echec(t("Ce compte s'utilise sur l'application mobile SchoolConnect.", "This account is used on the SchoolConnect mobile app."));
    }
    const etablissementId = trouve.r!.etablissementId;
    const etablissementNom = etablissementId ? await b.getEtablissement(etablissementId, jeton).then((e) => e.nom).catch(() => null) : null;
    session = {
      userId: u.id,
      role: trouve.web,
      etablissementId,
      etablissementNom,
      nomAffiche: `${u.prenom} ${u.nom}`,
      initiales: `${u.prenom[0] ?? ""}${u.nom[0] ?? ""}`.toUpperCase(),
      langue: lang,
      accessToken: jeton,
    };
  } catch (e) {
    return echec(messageErreur(e, lang));
  }
  await createSession(session);
  redirect(accueilDuRole(session.role, lang));
}

export async function deconnexion() {
  const lang = await getLangAction();
  await deleteSession();
  redirect(`/${lang}/connexion`);
}

/**
 * Mot de passe oublié en trois étapes sur la même page :
 * 1. identifiant → code envoyé par SMS ; 2. code → jeton ; 3. nouveau mot de passe.
 * [etape] et les données intermédiaires transitent par des champs cachés du formulaire.
 */
export async function motDePasseOublie(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const t = await getTAction();
  const lang = await getLangAction();
  const etape = String(fd.get("etape") ?? "demande");
  const identifiant = String(fd.get("identifiant") ?? "").trim();
  try {
    if (etape === "demande") {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifiant)) return echec(t("Saisissez votre adresse e-mail.", "Enter your email address."));
      await b.demanderCode(identifiant);
      return {
        ok: true,
        message: t("Si un compte correspond, un code à 6 chiffres vient d'être envoyé.", "If an account matches, a 6-digit code has just been sent."),
        donnees: { etape: "code", identifiant },
      };
    }
    if (etape === "code") {
      const code = String(fd.get("code") ?? "").replace(/\D/g, "");
      if (code.length !== 6) return { ok: false, message: t("Le code contient 6 chiffres.", "The code has 6 digits."), donnees: { etape: "code", identifiant } };
      const { jeton } = await b.verifierCode(identifiant, code);
      return { ok: true, message: t("Code vérifié. Choisissez votre nouveau mot de passe.", "Code verified. Choose your new password."), donnees: { etape: "nouveau", jeton } };
    }
    const jeton = String(fd.get("jeton") ?? "");
    const res = schemaMotDePasse.safeParse({ motDePasse: fd.get("motDePasse"), confirmation: fd.get("confirmation") });
    if (!res.success) {
      return {
        ok: false,
        message: t("8 caractères minimum, et les deux mots de passe doivent être identiques.", "At least 8 characters, and both passwords must match."),
        donnees: { etape: "nouveau", jeton },
      };
    }
    await b.reinitialiserMotDePasse(jeton, res.data.motDePasse);
    return { ok: true, message: t("Mot de passe modifié. Vous pouvez vous connecter.", "Password changed. You can now sign in."), donnees: { etape: "fini" } };
  } catch (e) {
    return { ok: false, message: messageErreur(e, lang), donnees: etape === "code" ? { etape: "code", identifiant } : { etape: "demande" } };
  }
}

const schemaMotDePasse = z
  .object({ motDePasse: z.string().min(8), confirmation: z.string() })
  .refine((v) => v.motDePasse === v.confirmation, { path: ["confirmation"] });

export async function changerMotDePasse(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const t = await getTAction();
  const actuel = String(fd.get("actuel") ?? "");
  const res = schemaMotDePasse.safeParse({ motDePasse: fd.get("motDePasse"), confirmation: fd.get("confirmation") });
  if (!res.success)
    return echec(t("8 caractères minimum, et les deux mots de passe doivent être identiques.", "At least 8 characters, and both passwords must match."));
  try {
    await b.changerMotDePasse(actuel, res.data.motDePasse);
  } catch (e) {
    return echec(messageErreur(e, await getLangAction()));
  }
  return { ok: true, message: t("Mot de passe modifié.", "Password changed.") };
}

export async function modifierProfil(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const t = await getTAction();
  const s = await getSession();
  if (!s) return echec(t("Session expirée.", "Session expired."));
  const telephone = String(fd.get("telephone") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  // L'adresse e-mail est l'identifiant de connexion au web : elle reste obligatoire.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return echec(t("Adresse e-mail obligatoire et valide.", "A valid email is required."));
  try {
    await b.modifierProfil({ telephone: telephone ? b.normaliserIdentifiant(telephone) : undefined, email, langue: "fr" });
  } catch (e) {
    return echec(messageErreur(e, await getLangAction()));
  }
  refresh();
  return { ok: true, message: t("Profil enregistré.", "Profile saved.") };
}
