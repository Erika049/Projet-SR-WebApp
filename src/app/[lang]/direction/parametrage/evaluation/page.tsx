// Route : /[lang]/direction/parametrage/evaluation — Règles d'évaluation : barème, seuils, appréciations (CU-DIR-02).
import { getT } from "@/lib/i18n/server";
import { parametrage } from "@/features/parametrage/queries";
import { EvaluationForm } from "@/features/parametrage/components/forms";
import { Card, CardHeader, Note } from "@/components/ui/card";

export default async function ParametrageEvaluationPage() {
  const [t, p] = await Promise.all([getT(), parametrage()]);
  return (
    <div className="grid gap-6 xl:grid-cols-[3fr_2fr]">
      <Card>
        <CardHeader titre={t("Évaluation", "Assessment")} />
        <EvaluationForm valeurs={p.evaluation} />
      </Card>
      <Note titre={t("Comment ces paramètres sont utilisés", "How these settings are used")}>
        {t(
          "Les moyennes par matière, la moyenne générale et les rangs sont calculés automatiquement à partir des notes et des coefficients. Les seuils déterminent les appréciations (tableau d'honneur, avertissement) proposées sur les bulletins. Les absences non justifiées au-delà du délai sont signalées au surveillant général.",
          "Subject averages, overall average and ranks are computed automatically from marks and coefficients. Thresholds drive the comments (honour roll, warning) suggested on report cards. Absences not justified within the delay are flagged to the head of discipline.",
        )}
      </Note>
    </div>
  );
}
