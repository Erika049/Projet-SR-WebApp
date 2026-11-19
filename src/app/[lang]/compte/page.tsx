// Route : /[lang]/compte — Mon compte : profil, langue, mot de passe (tous les rôles web).
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/dal";
import { ESPACE_PAR_ROLE, LIBELLE_ROLE } from "@/lib/auth/roles";
import { getLang, getT } from "@/lib/i18n/server";
import { derniereConnexion } from "@/lib/format";
import { getUtilisateur } from "@/features/auth/queries";
import { MotDePasseForm, ProfilForm } from "@/features/auth/components/compte-forms";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

export default async function ComptePage() {
  const [t, lang, session] = await Promise.all([getT(), getLang(), getCurrentUser()]);
  const u = await getUtilisateur(session.userId);
  return (
    <>
      <PageHeader titre={t("Mon compte", "My account")} />
      <PageBody>
        <Card>
          <div className="flex items-center gap-4">
            <Avatar nom={session.nomAffiche} taille="lg" />
            <div>
              <p className="text-lg font-bold text-navy-800">{session.nomAffiche}</p>
              <p className="text-sm text-muted">{t(...LIBELLE_ROLE[session.role])}{session.etablissementNom ? ` · ${session.etablissementNom}` : ""}</p>
              {u && <p className="text-xs text-muted">{t("Dernière connexion", "Last sign-in")} : {derniereConnexion(u.derniereConnexion, lang)}</p>}
            </div>
          </div>
        </Card>
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader titre={t("Profil", "Profile")} />
            <ProfilForm telephone={u?.telephone ?? ""} email={u?.email ?? ""} langue={lang} />
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHeader titre={t("Sécurité", "Security")} />
              <MotDePasseForm />
            </Card>
            <Card>
              <CardHeader titre={t("Préférences de notification", "Notification preferences")} />
              <Link href={`/${lang}/${ESPACE_PAR_ROLE[session.role]}/notifications`} className="text-sm font-semibold text-navy-700 hover:underline">
                {t("Gérer mes notifications →", "Manage my notifications →")}
              </Link>
            </Card>
          </div>
        </div>
      </PageBody>
    </>
  );
}
