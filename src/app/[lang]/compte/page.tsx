// Route : /[lang]/compte — Mon compte : profil, langue, mot de passe (GET/PATCH /auth/me, PUT /auth/me/mot-de-passe).
import { getCurrentUser } from "@/lib/auth/dal";
import { LIBELLE_ROLE } from "@/lib/auth/roles";
import { getT } from "@/lib/i18n/server";
import { moi } from "@/lib/api/backend";
import { MotDePasseForm, ProfilForm } from "@/features/auth/components/compte-forms";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";

export default async function ComptePage() {
  const [t, session, u] = await Promise.all([getT(), getCurrentUser(), moi()]);
  return (
    <>
      <PageHeader titre={t("Mon compte", "My account")} />
      <PageBody>
        <Card>
          <div className="flex items-center gap-4">
            <Avatar nom={session.nomAffiche} taille="lg" />
            <div>
              <p className="text-lg font-bold text-navy-800">{u.prenom} {u.nom}</p>
              <p className="text-sm text-muted">{t(...LIBELLE_ROLE[session.role])}{session.etablissementNom ? ` · ${session.etablissementNom}` : ""}</p>
            </div>
          </div>
        </Card>
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader titre={t("Profil", "Profile")} />
            <ProfilForm telephone={u.telephone ?? ""} email={u.email ?? ""} />
          </Card>
          <Card>
            <CardHeader titre={t("Sécurité", "Security")} />
            <MotDePasseForm />
          </Card>
        </div>
      </PageBody>
    </>
  );
}
