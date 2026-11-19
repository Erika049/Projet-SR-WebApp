"use server";
// Authentification : connexion, déconnexion, mot de passe oublié, activation d'invitation, profil.
import { redirect } from "next/navigation";
import { refresh } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { USE_MOCK, apiFetch, ecrire } from "@/lib/api/client";
import { messageErreur } from "@/lib/api/errors";
import { createSession, deleteSession, getSession } from "@/lib/auth/session";
import { accueilDuRole, ROLES_WEB } from "@/lib/auth/roles";
import { getLangAction, getTAction } from "@/lib/i18n/server";
import { echec, type EtatFormulaire } from "@/lib/actions";
import * as m from "@/lib/api/mock/plateforme";
import type { Etablissement, Utilisateur } from "@/types/domain";

export async function connexion(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const t = await getTAction();
  const lang = await getLangAction();
  const identifiant = String(fd.get("identifiant") ?? "").trim();
  const motDePasse = String(fd.get("motDePasse") ?? "");
  if (!identifiant || !motDePasse) return echec(t("Saisissez votre identifiant et votre mot de passe.", "Enter your username and password."));

  let utilisateur: Utilisateur;
  let etablissement: Pick<Etablissement, "id" | "nom" | "ville"> | null;
  let jetons: { accessToken?: string; refreshToken?: string } = {};
  try {
    if (USE_MOCK) {
      ({ utilisateur, etablissement } = m.authentifier(identifiant, motDePasse));
    } else {
      const r = await apiFetch<{ utilisateur: Utilisateur; etablissement: Etablissement | null; accessToken: string; refreshToken: string }>("/auth/connexion", {
        method: "POST",
        body: { identifiant, motDePasse },
      });
      ({ utilisateur, etablissement } = r);
      jetons = { accessToken: r.accessToken, refreshToken: r.refreshToken };
    }
  } catch (e) {
    return echec(messageErreur(e, lang));
  }
  if (!ROLES_WEB.includes(utilisateur.role)) {
    return echec(t("Ce compte s'utilise sur l'application mobile SchoolConnect.", "This account is used on the SchoolConnect mobile app."));
  }
  await createSession({
    userId: utilisateur.id,
    role: utilisateur.role,
    etablissementId: utilisateur.etablissementId,
    etablissementNom: etablissement ? etablissement.nom.replace(/^Lycée bilingue/, "Lycée") : null,
    nomAffiche: `${utilisateur.civilite} ${utilisateur.prenom} ${utilisateur.nom}`,
    initiales: `${utilisateur.prenom[0]}${utilisateur.nom[0]}`,
    langue: lang,
    ...jetons,
  });
  redirect(accueilDuRole(utilisateur.role, lang));
}

export async function deconnexion() {
  const lang = await getLangAction();
  await deleteSession();
  redirect(`/${lang}/connexion`);
}

export async function motDePasseOublie(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const t = await getTAction();
  const identifiant = String(fd.get("identifiant") ?? "").trim();
  if (!identifiant) return echec(t("Saisissez votre courriel ou votre téléphone.", "Enter your email or phone number."));
  await ecrire(() => m.demanderReinitialisation(identifiant), "/auth/mot-de-passe-oublie", "POST", { identifiant });
  return {
    ok: true,
    message: t(
      "Si un compte correspond, un code de réinitialisation vient d'être envoyé par SMS ou par courriel.",
      "If an account matches, a reset code has just been sent by SMS or email.",
    ),
  };
}

const schemaMotDePasse = z
  .object({ motDePasse: z.string().min(8), confirmation: z.string() })
  .refine((v) => v.motDePasse === v.confirmation, { path: ["confirmation"] });

export async function activerInvitation(token: string, _: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const t = await getTAction();
  const res = schemaMotDePasse.safeParse({ motDePasse: fd.get("motDePasse"), confirmation: fd.get("confirmation") });
  if (!res.success)
    return echec(t("8 caractères minimum, et les deux mots de passe doivent être identiques.", "At least 8 characters, and both passwords must match."));
  try {
    await ecrire(() => m.activerInvitation(token, res.data.motDePasse), "/auth/invitation", "POST", { token, motDePasse: res.data.motDePasse });
  } catch (e) {
    return echec(messageErreur(e, await getLangAction()));
  }
  return { ok: true, message: t("Votre compte est activé. Vous pouvez vous connecter.", "Your account is active. You can now sign in.") };
}

export async function changerMotDePasse(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const t = await getTAction();
  const s = await getSession();
  if (!s) return echec(t("Session expirée.", "Session expired."));
  const actuel = String(fd.get("actuel") ?? "");
  const res = schemaMotDePasse.safeParse({ motDePasse: fd.get("motDePasse"), confirmation: fd.get("confirmation") });
  if (!res.success)
    return echec(t("8 caractères minimum, et les deux mots de passe doivent être identiques.", "At least 8 characters, and both passwords must match."));
  try {
    await ecrire(() => m.changerMotDePasse(s.userId, actuel, res.data.motDePasse), "/moi/mot-de-passe", "PUT", { actuel, nouveau: res.data.motDePasse });
  } catch (e) {
    return echec(messageErreur(e, await getLangAction()));
  }
  return { ok: true, message: t("Mot de passe modifié.", "Password changed.") };
}

export async function modifierProfil(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const t = await getTAction();
  const s = await getSession();
  if (!s) return echec(t("Session expirée.", "Session expired."));
  const langue = fd.get("langue") === "en" ? "en" : "fr";
  const data = { telephone: String(fd.get("telephone") ?? "").trim(), email: String(fd.get("email") ?? "").trim(), langue: langue as "fr" | "en" };
  if (!data.telephone && !data.email) return echec(t("Le téléphone ou le courriel est obligatoire.", "Phone or email is required."));
  await ecrire(() => m.modifierProfil(s.userId, data), "/moi", "PUT", data);
  await createSession({ ...s, langue });
  (await cookies()).set("NEXT_LOCALE", langue, { path: "/", maxAge: 31536000 });
  refresh();
  return { ok: true, message: t("Profil enregistré.", "Profile saved.") };
}
