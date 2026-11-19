// Route : /[lang]/surveillance/retards-sorties — Absences, retards et sorties anticipées du jour (CU-SUR-04).
import { getLang, getT } from "@/lib/i18n/server";
import { aujourdhuiIso, dateLongue, heure } from "@/lib/format";
import { evenementsPresence, repertoire } from "@/lib/api/backend";
import { enregistrerRetardSortie } from "@/features/presences/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LigneVide, Table, Td, Th } from "@/components/ui/data-table";
import { Field, Input, Select, Choix } from "@/components/ui/form-field";
import { Formulaire } from "@/components/ui/formulaire";

export default async function RetardsSortiesPage() {
  const [t, lang, evenements, eleves] = await Promise.all([getT(), getLang(), evenementsPresence(), repertoire()]);
  const libelle = (s: string) => (s === "ABSENT" ? t("Absent", "Absent") : s === "RETARD" ? t("Retard", "Late") : t("Sortie anticipée", "Early exit"));
  const options = eleves
    .filter((e) => e.classeId && e.statut === "VALIDE")
    .map((e) => ({ value: `${e.eleveId}|${e.classeId}`, label: `${e.nom} ${e.prenom} · ${e.classeNom}` }));
  const maintenant = new Date().toTimeString().slice(0, 5);

  return (
    <>
      <PageHeader titre={t("Retards et sorties", "Lates and exits")} sousTitre={dateLongue(aujourdhuiIso(), lang)} />
      <PageBody>
        <div className="grid gap-6 xl:grid-cols-[2fr_3fr]">
          <Card className="h-fit">
            <CardHeader
              titre={t("Enregistrer un retard ou une sortie", "Record a late arrival or early exit")}
              sousTitre={t("L'appel du jour de la classe est complété et les parents sont prévenus.", "The class roll call for today is updated and the parents are notified.")}
            />
            <Formulaire action={enregistrerRetardSortie} libelle={t("Enregistrer", "Save")}>
              <Field label={t("Élève", "Student")}>
                <Select name="eleve" options={options} vide={t("Choisir un élève…", "Choose a student…")} required />
              </Field>
              <Field label={t("Type", "Type")}>
                <Choix name="type" defaut="retard" options={[{ value: "retard", label: t("Retard", "Late") }, { value: "sortie", label: t("Sortie anticipée", "Early exit") }]} />
              </Field>
              <Field label={t("Heure", "Time")}>
                <Input type="time" name="heure" defaultValue={maintenant} required />
              </Field>
            </Formulaire>
          </Card>
          <Card>
            <CardHeader titre={t(`Aujourd'hui · ${evenements.length} élève(s)`, `Today · ${evenements.length} student(s)`)} />
            <Table>
              <thead>
                <tr>
                  <Th>{t("Élève", "Student")}</Th>
                  <Th>{t("Classe", "Class")}</Th>
                  <Th>{t("Statut", "Status")}</Th>
                  <Th>{t("Heure", "Time")}</Th>
                  <Th>{t("Parents", "Parents")}</Th>
                </tr>
              </thead>
              <tbody>
                {evenements.length === 0 && <LigneVide colSpan={5} texte={t("Aucune absence, aucun retard aujourd'hui.", "No absence or late arrival today.")} />}
                {evenements.map((e) => (
                  <tr key={`${e.appelId}-${e.eleveId}`}>
                    <Td className="font-semibold">{e.nom} {e.prenom}</Td>
                    <Td>{e.classeNom}</Td>
                    <Td><Badge ton={e.statut === "ABSENT" ? "danger" : "alerte"}>{libelle(e.statut)}</Badge></Td>
                    <Td>{(e.heureArrivee ?? e.heureSortie)?.slice(0, 5) ?? "—"}</Td>
                    <Td className="text-xs">
                      {e.parentsNotifiesLe ? (
                        <span className="text-brand-700">{t("prévenus", "notified")} · {heure(e.parentsNotifiesLe)}</span>
                      ) : (
                        <span className="font-semibold text-amber-700">{t("à vérifier (Présences)", "to check (Attendance)")}</span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
