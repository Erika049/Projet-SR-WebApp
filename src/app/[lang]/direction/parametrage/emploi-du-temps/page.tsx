// Route : /[lang]/direction/parametrage/emploi-du-temps?classe= — Emploi du temps d'une classe
// (consulté par les enseignants et les parents dans l'application mobile).
import { getLang, getT } from "@/lib/i18n/server";
import { premier } from "@/lib/utils";
import { classes as lireClasses, creneauxClasse, matieres as lireMatieres } from "@/lib/api/backend";
import { creerCreneau, supprimerCreneau } from "@/features/parametrage/actions";
import { Card, CardHeader } from "@/components/ui/card";
import { ActionButton } from "@/components/ui/action-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, Input, Select } from "@/components/ui/form-field";
import { Formulaire } from "@/components/ui/formulaire";
import { Tabs } from "@/components/ui/tabs";

const JOURS: [string, string][] = [["Lundi", "Monday"], ["Mardi", "Tuesday"], ["Mercredi", "Wednesday"], ["Jeudi", "Thursday"], ["Vendredi", "Friday"], ["Samedi", "Saturday"]];

export default async function EmploiDuTempsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const [sp, t, lang, classes, matieres] = await Promise.all([searchParams, getT(), getLang(), lireClasses(), lireMatieres()]);
  const classe = classes.find((c) => c.id === premier(sp.classe)) ?? classes[0];
  if (!classe) return <EmptyState titre={t("Créez d'abord une classe", "Create a class first")} />;
  const creneaux = await creneauxClasse(classe.id);
  const base = `/${lang}/direction/parametrage/emploi-du-temps`;
  return (
    <div className="space-y-6">
      <Tabs onglets={classes.map((c) => ({ href: `${base}?classe=${c.id}`, libelle: c.nom }))} />
      <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
        <Card>
          <CardHeader titre={t(`Semaine type · ${classe.nom}`, `Weekly timetable · ${classe.nom}`)} />
          {creneaux.length === 0 ? (
            <EmptyState titre={t("Aucun cours", "No lesson")} />
          ) : (
            <div className="space-y-4">
              {JOURS.map((j, i) => {
                const jour = creneaux.filter((c) => c.jourSemaine === i + 1);
                if (!jour.length) return null;
                return (
                  <div key={j[0]}>
                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-brand-600">{t(...j)}</p>
                    <ul className="divide-y divide-line rounded-xl border border-line">
                      {jour.map((c) => (
                        <li key={c.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                          <span>
                            <strong>{c.heureDebut.slice(0, 5)} – {c.heureFin.slice(0, 5)}</strong> · {c.matiereNom}
                            <span className="text-muted"> · {c.enseignantNom ?? t("enseignant non affecté", "no teacher")}{c.salle ? ` · ${c.salle}` : ""}</span>
                          </span>
                          <ActionButton action={supprimerCreneau.bind(null, c.id)} variante="danger" confirmation={t("Supprimer ce cours ?", "Delete this lesson?")}>{t("Retirer", "Remove")}</ActionButton>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
        <Card className="h-fit">
          <CardHeader titre={t("Ajouter un cours", "Add a lesson")} sousTitre={t("L'enseignant affecté à la classe pour cette matière est repris.", "The teacher assigned to the class for this subject is used.")} />
          <Formulaire action={creerCreneau} libelle={t("Ajouter", "Add")}>
            <input type="hidden" name="classeId" value={classe.id} />
            <Field label={t("Matière", "Subject")}><Select name="matiereId" options={matieres.map((m) => ({ value: m.id, label: m.nom }))} /></Field>
            <Field label={t("Jour", "Day")}><Select name="jourSemaine" options={JOURS.map((j, i) => ({ value: String(i + 1), label: t(...j) }))} /></Field>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label={t("Début", "Start")}><Input type="time" name="heureDebut" required /></Field>
              <Field label={t("Fin", "End")}><Input type="time" name="heureFin" required /></Field>
            </div>
            <Field label={t("Salle", "Room")}><Input name="salle" /></Field>
          </Formulaire>
        </Card>
      </div>
    </div>
  );
}
