// Route : /[lang]/direction/personnel/[personnelId] — Fiche du membre (CU-DIR-03).
// Onglets : Profil / Affectations / Assiduité / Activité (?onglet=).
import { notFound } from "next/navigation";
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte, derniereConnexion, quand } from "@/lib/format";
import { CONTRAT, FONCTION, STATUT_COMPTE, lib, ton } from "@/lib/labels";
import { nomCivil, premier } from "@/lib/utils";
import { getMembre } from "@/features/personnel/queries";
import { listerClasses } from "@/features/parametrage/queries";
import { changerStatut, modifierAffectations, renvoyerInvitation } from "@/features/personnel/actions";
import { AffectationsForm } from "@/features/personnel/components/affectations-form";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, Details } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import { Table, Td, Th, LigneVide } from "@/components/ui/data-table";
import { Avatar } from "@/components/ui/avatar";
import { ActionButton } from "@/components/ui/action-button";
import { Dialog } from "@/components/ui/dialog";
import { StatCard } from "@/components/ui/stat-card";

export default async function FicheMembrePage({ params, searchParams }: PageProps<"/[lang]/direction/personnel/[personnelId]">) {
  const [{ personnelId }, sp, t, lang] = await Promise.all([params, searchParams, getT(), getLang()]);
  const [m, classes] = await Promise.all([getMembre(personnelId), listerClasses()]);
  if (!m) notFound();
  const onglet = premier(sp.onglet) ?? "profil";
  const base = `/${lang}/direction/personnel/${m.id}`;
  const a = m.assiduiteMois;

  return (
    <>
      <PageHeader titre={t("Fiche du membre", "Staff profile")} filAriane={[{ href: `/${lang}/direction/personnel`, libelle: t("Personnel", "Staff") }]} sousTitre={`${m.civilite} ${m.prenom} ${m.nom}`} />
      <PageBody>
        <Card>
          <div className="flex flex-wrap items-center gap-4">
            <Avatar nom={`${m.prenom} ${m.nom}`} taille="lg" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-navy-800">{m.civilite} {m.prenom} {m.nom}</h2>
                <Badge ton={ton(STATUT_COMPTE, m.statut)}>{lib(STATUT_COMPTE, m.statut, t)}</Badge>
              </div>
              <p className="text-sm text-muted">{m.matricule} · {lib(FONCTION, m.fonction, t)} · {m.specialite}</p>
            </div>
          </div>
        </Card>
        <Tabs
          onglets={[
            { href: base, libelle: t("Profil", "Profile") },
            { href: `${base}?onglet=affectations`, libelle: t("Affectations", "Assignments") },
            { href: `${base}?onglet=assiduite`, libelle: t("Assiduité", "Attendance") },
            { href: `${base}?onglet=activite`, libelle: t("Activité", "Activity") },
          ]}
        />

        {onglet === "profil" && (
          <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <Card>
                <CardHeader titre={t("Informations", "Information")} />
                <Details
                  lignes={[
                    [t("Date de naissance", "Date of birth"), dateCourte(m.dateNaissance, lang)],
                    [t("Téléphone", "Phone"), m.telephone],
                    [t("Courriel", "Email"), m.email],
                    [t("Contrat", "Contract"), lib(CONTRAT, m.contrat, t)],
                    [t("Prise de service", "Start date"), dateCourte(m.datePriseService, lang)],
                    [t("Heures par semaine", "Hours per week"), `${m.heuresSemaine} h`],
                    ...(m.congeJusquau ? ([[t("En congé jusqu'au", "On leave until"), dateCourte(m.congeJusquau, lang)]] as [string, string][]) : []),
                  ]}
                />
              </Card>
              <Card>
                <CardHeader titre={t("Compte", "Account")} />
                <Details
                  lignes={[
                    [t("Accès", "Access"), m.compte.acces === "mobile" ? t("Application mobile", "Mobile app") : m.compte.acces === "web" ? t("Application web", "Web app") : t("Aucun", "None")],
                    [t("Invitation", "Invitation"), m.compte.invitation === "acceptee" ? t("Acceptée", "Accepted") : m.compte.invitation === "envoyee" ? t("Envoyée", "Sent") : "—"],
                    [t("Dernière connexion", "Last sign-in"), derniereConnexion(m.compte.derniereConnexion, lang)],
                  ]}
                />
                <div className="mt-4 flex flex-wrap gap-2">
                  <ActionButton action={renvoyerInvitation.bind(null, m.id)}>{t("Renvoyer l'invitation", "Resend invitation")}</ActionButton>
                  <ActionButton action={renvoyerInvitation.bind(null, m.id)} confirmation={t("Un lien de réinitialisation sera envoyé. Continuer ?", "A reset link will be sent. Continue?")}>
                    {t("Réinitialiser le mot de passe", "Reset password")}
                  </ActionButton>
                </div>
              </Card>
            </div>
            <Card className="h-fit space-y-5">
              <CardHeader titre={t("Zone sensible", "Danger zone")} />
              {m.statut === "actif" ? (
                <>
                  <div className="text-sm">
                    <p className="font-semibold">{t("Mettre en congé", "Put on leave")}</p>
                    <p className="mb-2 text-muted">{t("Les appels et les notes ne lui sont plus proposés.", "Roll calls and marks are no longer offered to them.")}</p>
                    <Dialog declencheur={t("Mettre en congé", "Put on leave")} titre={t("Mettre en congé", "Put on leave")}>
                      <form action={changerStatut.bind(null, m.id, "conge")} className="space-y-3">
                        <label className="block text-sm font-semibold">
                          {t("Jusqu'au", "Until")}
                          <input type="date" name="jusquau" required className="input mt-1" />
                        </label>
                        <button className="rounded-lg bg-navy-700 px-4 py-2 text-sm font-semibold text-white">{t("Confirmer", "Confirm")}</button>
                      </form>
                    </Dialog>
                  </div>
                  <div className="text-sm">
                    <p className="font-semibold">{t("Suspendre le compte", "Suspend the account")}</p>
                    <p className="mb-2 text-muted">{t("Il ne peut plus se connecter. Les données sont conservées.", "They can no longer sign in. Data is kept.")}</p>
                    <ActionButton action={changerStatut.bind(null, m.id, "suspendu")} variante="danger" confirmation={t("Suspendre ce compte ?", "Suspend this account?")}>
                      {t("Suspendre", "Suspend")}
                    </ActionButton>
                  </div>
                </>
              ) : (
                <ActionButton action={changerStatut.bind(null, m.id, "actif")} variante="succes">
                  {t("Réactiver", "Reactivate")}
                </ActionButton>
              )}
            </Card>
          </div>
        )}

        {onglet === "affectations" && (
          <div className="grid gap-6 xl:grid-cols-2">
            <Card>
              <CardHeader titre={t("Affectations", "Assignments")} />
              <Table>
                <thead>
                  <tr>
                    <Th>{t("Classe", "Class")}</Th>
                    <Th>{t("Matière", "Subject")}</Th>
                    <Th>{t("Heures", "Hours")}</Th>
                    <Th>{t("Rôle", "Role")}</Th>
                  </tr>
                </thead>
                <tbody>
                  {m.affectationsDetaillees.length === 0 && <LigneVide colSpan={4} texte={t("Aucune affectation.", "No assignments.")} />}
                  {m.affectationsDetaillees.map((x) => (
                    <tr key={x.classeId}>
                      <Td className="font-semibold">{x.classe.libelle}</Td>
                      <Td>{x.matiere}</Td>
                      <Td>{x.heures} h</Td>
                      <Td>{x.titulaire ? <Badge ton="navy">{t("Titulaire", "Form teacher")}</Badge> : "—"}</Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
            {m.categorie === "enseignant" && (
              <Card>
                <CardHeader titre={t("Modifier les affectations", "Edit assignments")} />
                <AffectationsForm
                  action={modifierAffectations.bind(null, m.id)}
                  classes={classes.map((c) => ({ id: c.id, libelle: c.libelle }))}
                  heures={Object.fromEntries(m.affectations.map((x) => [x.classeId, x.heures]))}
                  matiere={m.specialite}
                />
              </Card>
            )}
          </div>
        )}

        {onglet === "assiduite" && (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard libelle={t("Heures prévues (mois)", "Planned hours (month)")} valeur={`${a.heuresPrevues} h`} />
            <StatCard libelle={t("Heures effectuées", "Hours taught")} valeur={`${a.heuresEffectuees} h`} ton="succes" />
            <StatCard libelle={t("Retards", "Late arrivals")} valeur={a.retards} ton="alerte" />
            <StatCard libelle={t("Absences", "Absences")} valeur={a.absences} detail={t(`${a.absencesNonJustifiees} non justifiée(s)`, `${a.absencesNonJustifiees} unjustified`)} ton="danger" />
          </div>
        )}

        {onglet === "activite" && (
          <Card>
            <CardHeader titre={t("Activité récente", "Recent activity")} />
            {m.activite.length === 0 ? (
              <p className="text-sm text-muted">{t("Aucune activité enregistrée.", "No recorded activity.")}</p>
            ) : (
              <ul className="divide-y divide-line">
                {m.activite.map((x) => (
                  <li key={x.id} className="flex justify-between py-2.5 text-sm">
                    <span><strong>{x.action}</strong> · {x.cible} <span className="text-muted">— {x.acteur}</span></span>
                    <span className="text-muted">{quand(x.date, lang)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
        <p className="sr-only">{nomCivil(m)}</p>
      </PageBody>
    </>
  );
}
