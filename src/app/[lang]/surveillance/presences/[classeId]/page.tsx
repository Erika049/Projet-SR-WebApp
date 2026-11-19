// Route : /[lang]/surveillance/presences/[classeId] — Saisir ou corriger l'appel quand l'enseignant ne l'a pas fait (CU-SUR-02).
import { notFound } from "next/navigation";
import { getLang, getT } from "@/lib/i18n/server";
import { dateLongue, aujourdhuiIso } from "@/lib/format";
import { appelClasse } from "@/features/presences/queries";
import { AppelForm } from "@/features/presences/components/appel-form";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AppelClassePage({ params }: PageProps<"/[lang]/surveillance/presences/[classeId]">) {
  const [{ classeId }, t, lang] = await Promise.all([params, getT(), getLang()]);
  const a = await appelClasse(classeId);
  if (!a) notFound();
  return (
    <>
      <PageHeader
        titre={`${t("Appel", "Roll call")} · ${a.classe.libelle}`}
        filAriane={[{ href: `/${lang}/surveillance/presences`, libelle: t("Présences", "Attendance") }]}
        sousTitre={dateLongue(aujourdhuiIso(), lang)}
        actions={a.appel ? <Badge ton="succes">{t(`Appel fait par ${a.appel.realisePar}`, `Roll call by ${a.appel.realisePar}`)}</Badge> : <Badge ton="danger">{t("Appel non fait", "No roll call yet")}</Badge>}
      />
      <PageBody>
        <Card className="max-w-3xl">
          <CardHeader titre={t(`${a.eleves.length} élèves`, `${a.eleves.length} students`)} />
          <AppelForm classeId={a.classe.id} lignes={a.eleves.map(({ eleve: e, statut }) => ({ id: e.id, nom: `${e.nom} ${e.prenom}`, matricule: e.matricule, statut }))} />
        </Card>
      </PageBody>
    </>
  );
}
