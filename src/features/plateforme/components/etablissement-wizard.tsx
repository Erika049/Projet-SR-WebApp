"use client";
// Assistant « Créer un établissement » (CU-SAD-01, CU-SAD-02) : Établissement → Directeur → Abonnement → Confirmation.
import Link from "next/link";
import { useActionState, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { assistantEtablissement } from "@/features/plateforme/actions";
import { ETAT_INITIAL } from "@/lib/actions";
import { useLang, useT } from "@/lib/i18n/client";
import { dateCourte, aujourdhuiIso } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Card, CardHeader } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/form-field";
import { FormMessage } from "@/components/ui/form-message";
import { Stepper } from "@/components/ui/stepper";
import { SubmitButton } from "@/components/ui/submit-button";
import { classesBouton } from "@/components/ui/button";

const REGIONS = ["Adamaoua", "Centre", "Est", "Extrême-Nord", "Littoral", "Nord", "Nord-Ouest", "Ouest", "Sud", "Sud-Ouest"];

function finPrevue(debut: string, mois: number) {
  if (!debut) return "";
  const [y, m, j] = debut.split("-").map(Number);
  const d = new Date(y, m - 1 + mois, j - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function EtablissementWizard({ code }: { code: string }) {
  const t = useT();
  const lang = useLang();
  const [etat, action] = useActionState(assistantEtablissement, ETAT_INITIAL);
  const v = (etat.donnees ?? {}) as Record<string, string>;
  const etape = Number(v.etape ?? 1);
  const e = etat.erreurs ?? {};
  const [plan, setPlan] = useState(v.plan ?? "standard");
  const [debut, setDebut] = useState(v.debut ?? aujourdhuiIso());
  const [duree, setDuree] = useState(Number(v.dureeMois ?? 12));

  // Les champs des autres étapes voyagent en champs cachés.
  const caches = (exclus: string[]) =>
    Object.entries(v)
      .filter(([k]) => !exclus.includes(k) && !["etape", "id", "code", "fin", "directeur", "email"].includes(k))
      .map(([k, val]) => <input key={k} type="hidden" name={k} value={val} />);

  const plans = [
    { value: "essai", nom: t("Essai", "Trial"), prix: t("Gratuit · 60 jours", "Free · 60 days"), detail: t("Jusqu'à 500 élèves", "Up to 500 students") },
    { value: "standard", nom: "Standard", prix: t("1 500 FCFA / élève", "1,500 FCFA / student"), detail: t("Par an · toutes les fonctions", "Per year · all features") },
    { value: "premium", nom: "Premium", prix: t("2 500 FCFA / élève", "2,500 FCFA / student"), detail: t("Par an · SMS + support", "Per year · SMS + support") },
  ];

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
      <div className="space-y-6">
        <Stepper etapes={[t("Établissement", "School"), t("Directeur", "Principal"), t("Abonnement", "Subscription"), t("Confirmation", "Confirmation")]} courante={etape} />
        <FormMessage etat={etat} />

        {etape === 4 && etat.ok ? (
          <Card className="text-center">
            <CheckCircle2 className="mx-auto size-12 text-brand-600" />
            <h2 className="mt-3 text-xl font-bold text-navy-800">{t("Établissement créé", "School created")}</h2>
            <p className="mt-1 text-sm text-muted">
              {t(`${v.nom} est prêt. Une invitation a été envoyée à ${v.directeur} par courriel et SMS.`, `${v.nom} is ready. An invitation was sent to ${v.directeur} by email and SMS.`)}
            </p>
            <dl className="mx-auto mt-6 grid max-w-sm grid-cols-2 gap-y-2 text-left text-sm">
              <dt className="text-muted">Code</dt><dd className="font-mono font-semibold">{v.code}</dd>
              <dt className="text-muted">{t("Directeur", "Principal")}</dt><dd className="font-semibold">{v.directeur}</dd>
              <dt className="text-muted">Plan</dt><dd>{v.plan} · {v.dureeMois} {t("mois", "months")}</dd>
              <dt className="text-muted">{t("Fin de l'abonnement", "Subscription end")}</dt><dd>{dateCourte(v.fin, lang)}</dd>
              <dt className="text-muted">{t("Invitation", "Invitation")}</dt><dd>{t("Envoyée à", "Sent to")} {v.email}</dd>
            </dl>
            <div className="mt-6 flex justify-center gap-2">
              <Link href={`/${lang}/plateforme/etablissements/${v.id}`} className={classesBouton("primaire")}>{t("Ouvrir l'établissement", "Open the school")}</Link>
              <Link href={`/${lang}/plateforme/etablissements`} className={classesBouton("secondaire")}>{t("Retour à la liste", "Back to list")}</Link>
            </div>
          </Card>
        ) : (
          <form action={action}>
            <input type="hidden" name="etape" value={etape} />
            <Card className="space-y-4">
              {etape === 1 && (
                <>
                  {caches(["nom", "type", "sousSysteme", "region", "ville", "adresse", "telephone", "email"])}
                  <CardHeader titre={t("Informations de l'établissement", "School information")} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t("Nom de l'établissement", "School name")} erreur={e.nom} className="sm:col-span-2"><Input name="nom" defaultValue={v.nom} /></Field>
                    <Field label={t("Code (généré automatiquement)", "Code (automatic)")}><Input value={code} disabled readOnly /></Field>
                    <Field label={t("Type", "Type")}>
                      <Select name="type" defaultValue={v.type} options={[{ value: "public", label: "Public" }, { value: "prive_laic", label: t("Privé laïc", "Private (secular)") }, { value: "prive_confessionnel", label: t("Privé confessionnel", "Private (faith-based)") }]} />
                    </Field>
                    <Field label={t("Sous-système", "Sub-system")}>
                      <Select name="sousSysteme" defaultValue={v.sousSysteme} options={[{ value: "francophone", label: t("Francophone", "French-speaking") }, { value: "anglophone", label: t("Anglophone", "English-speaking") }, { value: "bilingue", label: t("Bilingue", "Bilingual") }]} />
                    </Field>
                    <Field label={t("Région", "Region")} erreur={e.region}><Select name="region" defaultValue={v.region} options={REGIONS.map((r) => ({ value: r, label: r }))} /></Field>
                    <Field label={t("Ville", "City")} erreur={e.ville}><Input name="ville" defaultValue={v.ville} /></Field>
                    <Field label={t("Adresse", "Address")}><Input name="adresse" defaultValue={v.adresse} /></Field>
                    <Field label={t("Téléphone", "Phone")} erreur={e.telephone}><Input name="telephone" defaultValue={v.telephone} /></Field>
                    <Field label={t("Courriel de l'établissement", "School email")} erreur={e.email}><Input type="email" name="email" defaultValue={v.email} /></Field>
                  </div>
                </>
              )}
              {etape === 2 && (
                <>
                  {caches(["directeurCivilite", "directeurPrenom", "directeurNom", "directeurEmail", "directeurTelephone"])}
                  <CardHeader titre={t("Compte du directeur", "Principal account")} />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label={t("Civilité", "Title")}><Select name="directeurCivilite" defaultValue={v.directeurCivilite} options={[{ value: "M.", label: "M." }, { value: "Mme", label: "Mme" }]} /></Field>
                    <div />
                    <Field label={t("Prénom", "First name")} erreur={e.directeurPrenom}><Input name="directeurPrenom" defaultValue={v.directeurPrenom} /></Field>
                    <Field label={t("Nom", "Last name")} erreur={e.directeurNom}><Input name="directeurNom" defaultValue={v.directeurNom} /></Field>
                    <Field label={t("Courriel", "Email")} erreur={e.directeurEmail}><Input type="email" name="directeurEmail" defaultValue={v.directeurEmail} /></Field>
                    <Field label={t("Téléphone", "Phone")} erreur={e.directeurTelephone}><Input name="directeurTelephone" defaultValue={v.directeurTelephone} /></Field>
                  </div>
                  <p className="rounded-lg bg-navy-50 p-3 text-sm text-navy-800"><strong>{t("Invitation sécurisée", "Secure invitation")}</strong> · {t("Le directeur reçoit un lien pour choisir son mot de passe.", "The principal receives a link to choose their password.")}</p>
                </>
              )}
              {etape === 3 && (
                <>
                  {caches(["plan", "debut", "dureeMois"])}
                  <CardHeader titre={t("Choisir l'abonnement", "Choose the subscription")} />
                  <div className="grid gap-3 sm:grid-cols-3">
                    {plans.map((p) => (
                      <label key={p.value} className={cn("cursor-pointer rounded-xl border-2 p-4", plan === p.value ? "border-navy-700 bg-navy-50" : "border-line")}>
                        <input type="radio" name="plan" value={p.value} checked={plan === p.value} onChange={() => setPlan(p.value)} className="sr-only" />
                        <p className="font-bold text-navy-800">{p.nom}</p>
                        <p className="mt-1 text-sm font-semibold">{p.prix}</p>
                        <p className="text-xs text-muted">{p.detail}</p>
                      </label>
                    ))}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <Field label={t("Date de début", "Start date")} erreur={e.debut}><Input type="date" name="debut" value={debut} onChange={(ev) => setDebut(ev.target.value)} /></Field>
                    <Field label={t("Durée", "Duration")}>
                      <Select name="dureeMois" value={String(plan === "essai" ? 2 : duree)} onChange={(ev) => setDuree(Number(ev.target.value))} disabled={plan === "essai"} options={[2, 6, 12, 24].map((m) => ({ value: String(m), label: `${m} ${t("mois", "months")}` }))} />
                    </Field>
                    {plan === "essai" && <input type="hidden" name="dureeMois" value="2" />}
                    <Field label={t("Date de fin prévue", "Planned end date")}><Input value={dateCourte(finPrevue(debut, plan === "essai" ? 2 : duree) || debut, lang)} disabled readOnly /></Field>
                  </div>
                </>
              )}
              <div className="flex gap-2 pt-2">
                {etape === 1 ? (
                  <Link href={`/${lang}/plateforme/etablissements`} className={classesBouton("secondaire")}>{t("Annuler", "Cancel")}</Link>
                ) : (
                  <SubmitButton name="sens" value="retour" variante="secondaire">{t("Retour", "Back")}</SubmitButton>
                )}
                <SubmitButton name="sens" value="suivant">{etape === 3 ? t("Créer l'établissement", "Create the school") : t("Continuer", "Continue")}</SubmitButton>
              </div>
            </Card>
          </form>
        )}
      </div>
      <Card className="h-fit space-y-2 text-sm">
        <CardHeader titre={t("Ce qui sera créé", "What will be created")} />
        <p>✓ {t("L'établissement et son code unique", "The school and its unique code")}</p>
        <p>✓ {t("Le compte du directeur", "The principal's account")}</p>
        <p>✓ {t("Une invitation par courriel et SMS", "An invitation by email and SMS")}</p>
        <p>✓ {t("L'abonnement choisi et sa date de fin", "The chosen subscription and end date")}</p>
        <p>✓ {t("L'année scolaire à configurer", "The school year to configure")}</p>
        <p className="pt-2 text-muted">{t("Le directeur crée ensuite lui-même sa secrétaire, son personnel et ses classes.", "The principal then creates their secretary, staff and classes.")}</p>
      </Card>
    </div>
  );
}
