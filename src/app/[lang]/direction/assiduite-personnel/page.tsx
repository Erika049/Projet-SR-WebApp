// Route : /[lang]/direction/assiduite-personnel — Assiduité du personnel (CU-DIR-06).
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte, moisCourt } from "@/lib/format";
import { nomCivil } from "@/lib/utils";
import { assiduitePersonnel } from "@/features/assiduite-personnel/queries";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Table, Td, Th } from "@/components/ui/data-table";
import { StatCard } from "@/components/ui/stat-card";
import { Personne } from "@/components/ui/avatar";

export default async function AssiduitePersonnelPage() {
  const [t, lang, a] = await Promise.all([getT(), getLang(), assiduitePersonnel()]);
  const mois = moisCourt(new Date().toISOString().slice(0, 7), lang);
  const suivi = (s: string) =>
    s === "conge" ? <Badge ton="info">{t("En congé", "On leave")}</Badge> : s === "a_suivre" ? <Badge ton="alerte">{t("À suivre", "Monitor")}</Badge> : <Badge ton="succes">{t("Assidu", "Regular")}</Badge>;

  return (
    <>
      <PageHeader
        titre={t("Assiduité du personnel", "Staff attendance")}
        sousTitre={t("Les présences sont saisies par la surveillance générale et signalées par les enseignants depuis le mobile.", "Attendance is recorded by the discipline office and reported by teachers from the mobile app.")}
        actions={<ButtonLink href={`/api/exports/assiduite-personnel?lang=${lang}`} variante="secondaire" prefetch={false}>{t("Exporter Excel", "Export Excel")}</ButtonLink>}
      />
      <PageBody>
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard libelle={t("Taux de présence", "Attendance rate")} valeur={`${a.taux} %`} detail={mois} ton="succes" />
          <StatCard libelle={t("Retards ce mois", "Late this month")} valeur={a.retards} detail={t(`Sur ${a.enseignantsEnRetard} membres`, `Across ${a.enseignantsEnRetard} members`)} ton="alerte" />
          <StatCard libelle={t("Absences ce mois", "Absences this month")} valeur={a.absences} detail={t(`${a.nonJustifiees} non justifiées`, `${a.nonJustifiees} unjustified`)} ton="danger" />
        </div>
        <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
          <Card>
            <CardHeader titre={`${t("Enseignants", "Teachers")} · ${mois}`} />
            <Table>
              <thead>
                <tr>
                  <Th>{t("Enseignant", "Teacher")}</Th>
                  <Th>{t("Matière", "Subject")}</Th>
                  <Th>{t("Heures prévues", "Planned")}</Th>
                  <Th>{t("Heures effectuées", "Taught")}</Th>
                  <Th>{t("Retards", "Late")}</Th>
                  <Th>{t("Absences", "Absences")}</Th>
                  <Th>{t("Statut", "Status")}</Th>
                </tr>
              </thead>
              <tbody>
                {a.lignes.map((p) => (
                  <tr key={p.id}>
                    <Td><Personne nom={nomCivil(p)} /></Td>
                    <Td className="text-muted">{p.specialite}</Td>
                    <Td>{p.assiduiteMois.heuresPrevues} h</Td>
                    <Td className={p.assiduiteMois.heuresEffectuees < p.assiduiteMois.heuresPrevues ? "font-semibold text-amber-700" : ""}>{p.assiduiteMois.heuresEffectuees} h</Td>
                    <Td>{p.assiduiteMois.retards}</Td>
                    <Td>{p.assiduiteMois.absences}</Td>
                    <Td>{suivi(p.suivi)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
          <Card className="h-fit">
            <CardHeader titre={t("Points d'attention", "Watch points")} />
            <ul className="space-y-4">
              {a.pointsAttention.map(({ personnel: p, suivi: s, aRattraper }) => (
                <li key={p.id} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{nomCivil(p)}</span>
                    {suivi(s)}
                  </div>
                  <p className="text-muted">
                    {s === "conge" && p.congeJusquau
                      ? t(`En congé jusqu'au ${dateCourte(p.congeJusquau, lang)}`, `On leave until ${dateCourte(p.congeJusquau, lang)}`)
                      : p.assiduiteMois.absencesNonJustifiees
                        ? t(`${p.assiduiteMois.absencesNonJustifiees} absence(s) non justifiée(s)`, `${p.assiduiteMois.absencesNonJustifiees} unjustified absence(s)`)
                        : t(`${p.assiduiteMois.retards} retard(s)`, `${p.assiduiteMois.retards} late arrival(s)`)}
                    {aRattraper >= 6 && ` · ${t(`${aRattraper} h à rattraper`, `${aRattraper} h to make up`)}`}
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </PageBody>
    </>
  );
}
