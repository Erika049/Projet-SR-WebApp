// Route : /[lang]/plateforme/etablissements/[etablissementId] — Aperçu de l'établissement (CU-SAD-03).
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte } from "@/lib/format";
import { annees, getEtablissement, personnel } from "@/lib/api/backend";
import { Card, CardHeader, Details } from "@/components/ui/card";

export default async function EtablissementApercuPage({ params }: PageProps<"/[lang]/plateforme/etablissements/[etablissementId]">) {
  const [{ etablissementId }, t, lang] = await Promise.all([params, getT(), getLang()]);
  const [e, membres, liste] = await Promise.all([getEtablissement(etablissementId), personnel(etablissementId), annees(etablissementId)]);
  const courante = liste.find((a) => a.courante);
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader titre={t("Coordonnées", "Contact details")} />
        <Details
          lignes={[
            [t("Type", "Type"), e.type.toLowerCase().replace("_", " ")],
            [t("Ordre", "Education"), e.ordreEnseignement.toLowerCase()],
            [t("Région", "Region"), e.region ?? "—"],
            [t("Ville", "City"), e.ville ?? "—"],
            [t("Adresse", "Address"), e.adresse ?? "—"],
            [t("Téléphone", "Phone"), e.telephone ?? "—"],
            [t("Courriel", "Email"), e.email ?? "—"],
          ]}
        />
      </Card>
      <Card>
        <CardHeader titre={t("Activité", "Activity")} />
        <Details
          lignes={[
            [t("Année courante", "Current year"), courante ? `${courante.libelle} (${dateCourte(courante.dateDebut, lang)} → ${dateCourte(courante.dateFin, lang)})` : "—"],
            [t("Personnel", "Staff"), String(membres.length)],
            [t("Direction", "Management"), membres.filter((m) => m.roles.includes("DIRECTION")).map((m) => `${m.prenom} ${m.nom}`).join(", ") || "—"],
          ]}
        />
      </Card>
    </div>
  );
}
