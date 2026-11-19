// Dossier de l'élève (backend : /etablissements/{id}/repertoire-eleves/{eleveId}) : identité, classe, tuteurs,
// codes de liaison. Le secrétariat peut changer la classe et ajouter un tuteur (lien direct ou code).
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, Printer } from "lucide-react";
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte } from "@/lib/format";
import { classes as lireClasses, dossier as lireDossier } from "@/lib/api/backend";
import { affecterClasse, ajouterTuteur } from "@/features/eleves/actions";
import { traiterLiaison } from "@/features/liaisons/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, Details, Note } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/ui/action-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Choix, Field, Input, Select } from "@/components/ui/form-field";
import { Formulaire } from "@/components/ui/formulaire";

const LIENS: Record<string, [string, string]> = {
  PERE: ["Père", "Father"],
  MERE: ["Mère", "Mother"],
  TUTEUR_LEGAL: ["Tuteur légal", "Legal guardian"],
  AUTRE: ["Autre", "Other"],
};

export async function DossierEleve({ eleveId, espace, inscrit }: { eleveId: string; espace: "secretariat" | "direction"; inscrit?: boolean }) {
  const [t, lang, d, classes] = await Promise.all([getT(), getLang(), lireDossier(eleveId), lireClasses()]);
  if (!d) notFound();
  const e = d.eleve;
  const gestion = espace === "secretariat";
  const base = `/${lang}/${espace}/eleves`;
  const codesActifs = d.codes.filter((c) => !c.utilise && !c.expire);
  const STATUT: Record<string, [string, "succes" | "alerte" | "danger"]> = {
    VALIDE: [t("Lié", "Linked"), "succes"],
    EN_ATTENTE: [t("À valider", "Pending"), "alerte"],
    REVOQUE: [t("Retiré", "Removed"), "danger"],
  };

  return (
    <>
      <PageHeader
        titre={`${e.prenom} ${e.nom}`}
        filAriane={[{ href: base, libelle: t("Élèves", "Students") }]}
        sousTitre={`${e.matricule} · ${e.classeNom ?? t("sans classe", "no class")}`}
        actions={
          gestion ? (
            <>
              <Link href={`${base}/${eleveId}/certificat`} className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-navy-700">
                <FileText className="size-4" /> {t("Certificat de scolarité", "School certificate")}
              </Link>
              {codesActifs.length > 0 && (
                <Link href={`${base}/${eleveId}/fiche-liaison`} className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm font-semibold text-navy-700">
                  <Printer className="size-4" /> {t("Fiche de liaison", "Link sheet")}
                </Link>
              )}
            </>
          ) : undefined
        }
      />
      <PageBody>
        {inscrit && (
          <Note titre={t("Élève inscrit", "Student enrolled")} ton="navy">
            {codesActifs.length
              ? t(`Remettez au tuteur le code de liaison ${codesActifs[0].code} (fiche de liaison imprimable).`, `Give the guardian the link code ${codesActifs[0].code} (printable link sheet).`)
              : t("Le dossier est créé.", "The file is created.")}
          </Note>
        )}
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader titre={t("Identité et scolarité", "Identity and enrolment")} />
            <Details
              lignes={[
                [t("Nom", "Last name"), e.nom],
                [t("Prénom", "First name"), e.prenom],
                [t("Sexe", "Sex"), e.sexe === "F" ? t("Féminin", "Female") : t("Masculin", "Male")],
                [t("Naissance", "Born"), `${dateCourte(e.dateNaissance, lang)}${e.lieuNaissance ? ` · ${e.lieuNaissance}` : ""}`],
                [t("Nationalité", "Nationality"), d.nationalite ?? "—"],
                [t("Matricule", "Student ID"), e.matricule],
                [t("Classe", "Class"), e.classeNom ?? "—"],
                [t("Inscription", "Enrolment"), `${dateCourte(e.dateInscription, lang)} · ${d.typeInscription.toLowerCase()}${d.redoublant ? t(" · redoublant", " · repeating") : ""}`],
              ]}
            />
            {gestion && (
              <div className="mt-6 border-t border-line pt-4">
                <Formulaire action={affecterClasse.bind(null, eleveId)} libelle={t("Changer de classe", "Change class")} variante="secondaire" reinitialiser={false}>
                  <Field label={t("Classe", "Class")}>
                    <Select name="classeId" defaultValue={e.classeId ?? ""} vide={t("Choisir…", "Choose…")} options={classes.map((c) => ({ value: c.id, label: c.nom }))} />
                  </Field>
                </Formulaire>
              </div>
            )}
          </Card>
          <div className="space-y-6">
            <Card>
              <CardHeader titre={t("Parents et tuteurs", "Parents and guardians")} />
              {d.tuteurs.length === 0 ? (
                <EmptyState titre={t("Aucun parent lié", "No linked parent")} texte={t("Le parent saisit un code de liaison dans l'application mobile.", "The parent enters a link code in the mobile app.")} />
              ) : (
                <ul className="divide-y divide-line">
                  {d.tuteurs.map((tu) => (
                    <li key={tu.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                      <div>
                        <p className="font-semibold">{tu.prenom} {tu.nom} <span className="font-normal text-muted">· {t(...(LIENS[tu.lien] ?? LIENS.AUTRE))}</span></p>
                        <p className="text-xs text-muted">
                          {tu.telephone ?? "—"} · {[tu.peutPayer && t("paie", "pays"), tu.peutJustifier && t("justifie", "justifies")].filter(Boolean).join(", ") || t("consultation", "view only")}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge ton={STATUT[tu.statut][1]}>{STATUT[tu.statut][0]}</Badge>
                        {gestion && tu.statut === "EN_ATTENTE" && (
                          <>
                            <ActionButton action={traiterLiaison.bind(null, tu.id, eleveId, "refuser")} variante="danger">{t("Refuser", "Reject")}</ActionButton>
                            <ActionButton action={traiterLiaison.bind(null, tu.id, eleveId, "accepter")} variante="succes">{t("Accepter", "Accept")}</ActionButton>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            <Card>
              <CardHeader titre={t("Codes de liaison", "Link codes")} sousTitre={t("Valables 30 jours, utilisables une seule fois.", "Valid for 30 days, single use.")} />
              {d.codes.length === 0 ? (
                <p className="text-sm text-muted">{t("Aucun code généré.", "No code generated.")}</p>
              ) : (
                <ul className="divide-y divide-line text-sm">
                  {d.codes.map((c) => (
                    <li key={c.code} className="flex items-center justify-between py-2">
                      <span className="font-mono font-bold tracking-widest">{c.code}</span>
                      <span className="text-xs text-muted">
                        {c.utilise ? t("utilisé", "used") : c.expire ? t("expiré", "expired") : `${t("expire le", "expires on")} ${dateCourte(c.expireLe, lang)}`}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
            {gestion && (
              <Card>
                <CardHeader
                  titre={t("Ajouter un parent ou tuteur", "Add a parent or guardian")}
                  sousTitre={t("S'il a déjà un compte SchoolConnect, il est lié tout de suite ; sinon un code de liaison est généré.", "If they already have a SchoolConnect account they are linked at once; otherwise a link code is generated.")}
                />
                <Formulaire action={ajouterTuteur.bind(null, eleveId)} libelle={t("Enregistrer le tuteur", "Save guardian")}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label={t("Prénom", "First name")}><Input name="prenom" required /></Field>
                    <Field label={t("Nom", "Last name")}><Input name="nom" required /></Field>
                    <Field label={t("Téléphone", "Phone")}><Input name="telephone" placeholder="6XX XX XX XX" /></Field>
                    <Field label={t("Courriel (facultatif)", "Email (optional)")}><Input type="email" name="email" /></Field>
                  </div>
                  <Field label={t("Lien avec l'élève", "Relationship")}>
                    <Choix name="lien" defaut="MERE" options={Object.entries(LIENS).map(([value, l]) => ({ value, label: t(...l) }))} />
                  </Field>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <label className="flex items-center gap-2"><input type="checkbox" name="peutPayer" defaultChecked /> {t("Peut payer", "Can pay")}</label>
                    <label className="flex items-center gap-2"><input type="checkbox" name="peutJustifier" defaultChecked /> {t("Peut justifier les absences", "Can justify absences")}</label>
                  </div>
                </Formulaire>
              </Card>
            )}
          </div>
        </div>
      </PageBody>
    </>
  );
}
