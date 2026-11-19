// Route : /[lang]/surveillance/presences/[classeId]?date=AAAA-MM-JJ — Fiche d'appel d'une classe (CU-SUR-01/02).
// - Fiche soumise par l'enseignant : le surveillant général la vérifie, la corrige si besoin, puis prévient les parents.
// - Pas encore d'appel : le surveillant fait l'appel de rattrapage (les parents sont prévenus aussitôt).
import { notFound } from "next/navigation";
import { getLang, getT } from "@/lib/i18n/server";
import { dateLongue, aujourdhuiIso, heure } from "@/lib/format";
import { premier } from "@/lib/utils";
import { appelClasse } from "@/lib/api/backend";
import { AppelForm } from "@/features/presences/components/appel-form";
import { NotifierParentsForm } from "@/features/presences/components/notifier-parents-form";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function AppelClassePage({ params, searchParams }: PageProps<"/[lang]/surveillance/presences/[classeId]">) {
  const [{ classeId }, sp, t, lang] = await Promise.all([params, searchParams, getT(), getLang()]);
  const dateDemandee = premier(sp.date);
  const date = dateDemandee && /^\d{4}-\d{2}-\d{2}$/.test(dateDemandee) ? dateDemandee : aujourdhuiIso();
  const a = await appelClasse(classeId, date);
  if (!a) notFound();
  const aujourdhui = date === aujourdhuiIso();
  const appel = a.appel;
  const absents = a.eleves.filter((e) => e.statut !== "present");

  return (
    <>
      <PageHeader
        titre={`${t("Appel", "Roll call")} · ${a.classe.libelle}`}
        filAriane={[{ href: `/${lang}/surveillance/presences`, libelle: t("Présences", "Attendance") }]}
        sousTitre={dateLongue(date, lang)}
        actions={
          appel ? (
            appel.statut === "a_traiter" ? (
              <Badge ton="alerte">{t("Fiche à vérifier", "Roll call to check")}</Badge>
            ) : (
              <Badge ton="succes">{t(`Appel fait par ${appel.realisePar}`, `Roll call by ${appel.realisePar}`)}</Badge>
            )
          ) : (
            <Badge ton="danger">{t("Appel non fait", "No roll call yet")}</Badge>
          )
        }
      />
      <PageBody>
        {appel && (
          <Card className="max-w-3xl">
            <CardHeader
              titre={t("Fiche d'appel", "Roll call sheet")}
              sousTitre={[
                `${t("Soumise par", "Submitted by")} ${appel.realisePar}`,
                appel.matiere,
                appel.soumisLe ? `${t("à", "at")} ${heure(appel.soumisLe)}` : null,
                t(`${absents.length} absent(s) ou en retard`, `${absents.length} absent or late`),
              ]
                .filter(Boolean)
                .join(" · ")}
            />
            {appel.statut === "a_traiter" ? (
              <NotifierParentsForm classeId={a.classe.id} appelId={appel.id} aNotifier={appel.aNotifier} />
            ) : (
              <p className="text-sm text-muted">
                {absents.length === 0
                  ? t("Aucun absent : rien à notifier.", "No absentee: nothing to notify.")
                  : t(
                      `Parents prévenus${appel.traitePar ? ` par ${appel.traitePar}` : ""}${appel.traiteLe ? ` à ${heure(appel.traiteLe)}` : ""}.`,
                      `Parents notified${appel.traitePar ? ` by ${appel.traitePar}` : ""}${appel.traiteLe ? ` at ${heure(appel.traiteLe)}` : ""}.`,
                    )}
              </p>
            )}
          </Card>
        )}
        <Card className="max-w-3xl">
          <CardHeader
            titre={t(`${a.eleves.length} élèves`, `${a.eleves.length} students`)}
            sousTitre={aujourdhui ? t("Corrigez si besoin : les parents des élèves marqués absents ou en retard sont prévenus à l'enregistrement.", "Correct if needed: parents of students marked absent or late are notified when you save.") : undefined}
          />
          {aujourdhui ? (
            <AppelForm
              classeId={a.classe.id}
              lignes={a.eleves.map(({ eleve: e, statut, notifie }) => ({ id: e.id, nom: `${e.nom} ${e.prenom}`, matricule: e.matricule, statut, notifie }))}
            />
          ) : (
            <ul className="divide-y divide-line rounded-xl border border-line">
              {a.eleves.map(({ eleve: e, statut, notifie }) => (
                <li key={e.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                  <div>
                    <p className="font-semibold">{e.nom} {e.prenom}</p>
                    <p className="text-xs text-muted">{e.matricule}</p>
                  </div>
                  {statut === "present" ? (
                    <Badge ton="succes">{t("Présent", "Present")}</Badge>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Badge ton={statut === "absent" ? "danger" : "alerte"}>{statut === "absent" ? t("Absent", "Absent") : t("Retard", "Late")}</Badge>
                      <span className={notifie ? "text-xs text-brand-700" : "text-xs font-semibold text-amber-700"}>
                        {notifie ? t("parents prévenus", "parents notified") : t("à notifier", "to notify")}
                      </span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </PageBody>
    </>
  );
}
