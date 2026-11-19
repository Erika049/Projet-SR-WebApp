// Route : /[lang]/surveillance/retards-sorties — Retards et sorties anticipées (CU-SUR-04).
import { getLang, getT } from "@/lib/i18n/server";
import { dateLongue, aujourdhuiIso } from "@/lib/format";
import { listerRetardsSorties, retardsRepetes } from "@/features/presences/queries";
import { listerClasses } from "@/features/parametrage/queries";
import { annuaireEleves } from "@/features/eleves/queries";
import { RetardForm } from "@/features/presences/components/retard-form";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, Note } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";
import { Personne } from "@/components/ui/avatar";

export default async function RetardsSortiesPage() {
  const [t, lang, liste, repetes, classes, eleves] = await Promise.all([getT(), getLang(), listerRetardsSorties(), retardsRepetes(), listerClasses(), annuaireEleves()]);

  return (
    <>
      <PageHeader titre={t("Retards et sorties anticipées", "Lateness and early exits")} sousTitre={dateLongue(aujourdhuiIso(), lang)} />
      <PageBody>
        {repetes.length > 0 && (
          <Note titre={t("Retards répétés", "Repeated lateness")} ton="alerte">
            {repetes.map((r) => `${r.eleve.prenom} ${r.eleve.nom} (${r.eleve.classe.libelle}) : ${r.nombre} ${t("retards cette semaine", "late arrivals this week")}`).join(" · ")}
          </Note>
        )}
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <Card>
            <CardHeader titre={t("Aujourd'hui", "Today")} />
            <Table>
              <thead>
                <tr>
                  <Th>{t("Heure", "Time")}</Th>
                  <Th>{t("Élève", "Student")}</Th>
                  <Th>{t("Classe", "Class")}</Th>
                  <Th>{t("Type", "Type")}</Th>
                  <Th>{t("Motif", "Reason")}</Th>
                </tr>
              </thead>
              <tbody>
                {liste.length === 0 && <LigneVide colSpan={5} texte={t("Aucun retard ni sortie aujourd'hui.", "No lateness or exits today.")} />}
                {liste.map((r) => (
                  <tr key={r.id}>
                    <Td className="font-mono">{r.heure}</Td>
                    <Td><Personne nom={`${r.eleve.prenom} ${r.eleve.nom}`} /></Td>
                    <Td>{r.eleve.classe.libelle}</Td>
                    <Td>{r.type === "retard" ? <Badge ton="alerte">{t("Retard", "Late")}</Badge> : <Badge ton="info">{t("Sortie anticipée", "Early exit")}</Badge>}</Td>
                    <Td className="text-muted">{r.motif}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
          <Card className="h-fit">
            <CardHeader titre={t("Enregistrer", "Record")} />
            <RetardForm classes={classes.map((c) => ({ id: c.id, libelle: c.libelle }))} eleves={eleves} />
          </Card>
        </div>
      </PageBody>
    </>
  );
}
