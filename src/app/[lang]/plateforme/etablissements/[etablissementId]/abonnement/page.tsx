// Route : /[lang]/plateforme/etablissements/[etablissementId]/abonnement — Abonnement (CU-SAD-03).
import { notFound } from "next/navigation";
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte, fcfa } from "@/lib/format";
import { PLAN, lib } from "@/lib/labels";
import { getEtablissement } from "@/features/plateforme/queries";
import { prolongerAbonnement } from "@/features/plateforme/actions";
import { Card, CardHeader, Details } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";

export default async function EtablissementAbonnementPage({ params }: PageProps<"/[lang]/plateforme/etablissements/[etablissementId]/abonnement">) {
  const [{ etablissementId }, t, lang] = await Promise.all([params, getT(), getLang()]);
  const e = await getEtablissement(etablissementId);
  if (!e) notFound();
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader titre={t("Abonnement actuel", "Current subscription")} />
        <Details
          lignes={[
            ["Plan", lib(PLAN, e.plan, t)],
            [t("Début", "Start"), dateCourte(e.debutAbonnement, lang)],
            [t("Fin", "End"), dateCourte(e.finAbonnement, lang)],
            [t("Élèves facturés", "Billed students"), e.effectifEleves],
            [t("Montant annuel", "Annual amount"), fcfa(e.montantAnnuel, lang)],
          ]}
        />
      </Card>
      <Card>
        <CardHeader titre={t("Prolonger ou changer de plan", "Extend or change plan")} />
        <form action={prolongerAbonnement.bind(null, e.id)} className="space-y-4">
          <label className="block text-sm font-semibold">
            Plan
            <select name="plan" defaultValue={e.plan === "essai" ? "standard" : e.plan} className="input mt-1.5">
              <option value="standard">Standard · 1 500 FCFA / {t("élève", "student")}</option>
              <option value="premium">Premium · 2 500 FCFA / {t("élève", "student")}</option>
            </select>
          </label>
          <label className="block text-sm font-semibold">
            {t("Durée", "Duration")}
            <select name="mois" defaultValue="12" className="input mt-1.5">
              {[6, 12, 24].map((m) => <option key={m} value={m}>{m} {t("mois", "months")}</option>)}
            </select>
          </label>
          <SubmitButton>{e.plan === "essai" ? t("Convertir l'essai", "Convert the trial") : t("Prolonger l'abonnement", "Extend subscription")}</SubmitButton>
        </form>
      </Card>
    </div>
  );
}
