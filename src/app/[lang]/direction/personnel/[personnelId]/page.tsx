// Route : /[lang]/direction/personnel/[personnelId] — Fiche d'un membre : rôles, classes, emploi du temps.
import { notFound } from "next/navigation";
import { getLang, getT } from "@/lib/i18n/server";
import { affectations as lireAffectations, personnel } from "@/lib/api/backend";
import { ROLES_PERSONNEL } from "@/features/personnel/libelles";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, Details } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";

export default async function MembrePage({ params }: PageProps<"/[lang]/direction/personnel/[personnelId]">) {
  const [{ personnelId }, t, lang] = await Promise.all([params, getT(), getLang()]);
  const [membres, affectations] = await Promise.all([personnel(), lireAffectations()]);
  const m = membres.find((x) => x.utilisateurId === personnelId);
  if (!m) notFound();
  const siennes = affectations.filter((a) => a.enseignantId === personnelId);
  return (
    <>
      <PageHeader titre={`${m.prenom} ${m.nom}`} filAriane={[{ href: `/${lang}/direction/personnel`, libelle: t("Personnel", "Staff") }]} />
      <PageBody>
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader titre={t("Compte", "Account")} />
            <Details
              lignes={[
                [t("Téléphone", "Phone"), m.telephone ?? "—"],
                [t("Courriel", "Email"), m.email ?? "—"],
                [t("Rôles", "Roles"), <span key="r" className="flex flex-wrap gap-1">{m.roles.map((r) => <Badge key={r} ton="neutre">{t(...(ROLES_PERSONNEL[r] ?? [r, r]))}</Badge>)}</span>],
              ]}
            />
          </Card>
          <Card>
            <CardHeader titre={t("Classes et matières", "Classes and subjects")} />
            {siennes.length === 0 ? (
              <EmptyState titre={t("Aucune affectation", "No assignment")} texte={t("Affectez l'enseignant depuis la liste du personnel.", "Assign the teacher from the staff list.")} />
            ) : (
              <ul className="divide-y divide-line text-sm">
                {siennes.map((a) => (
                  <li key={a.id} className="flex justify-between py-2"><span className="font-semibold">{a.classeNom}</span><span className="text-muted">{a.matiereNom}</span></li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </PageBody>
    </>
  );
}
