// Dossier de l'élève : identité, tuteur et accès parent, historique des corrections, actions du secrétariat.
import Link from "next/link";
import { notFound } from "next/navigation";
import { FileText, KeyRound, Printer, Wallet } from "lucide-react";
import { getLang, getT } from "@/lib/i18n/server";
import { dateCourte, fcfa, jourMois } from "@/lib/format";
import { LIAISON, LIEN_TUTEUR, STATUT_CORRECTION, lib, ton } from "@/lib/labels";
import { getEleve } from "@/features/eleves/queries";
import { getSituation } from "@/features/finances/queries";
import { listerClasses } from "@/features/parametrage/queries";
import { affecterClasse, archiverDossier, completerPiece, demanderCorrection, regenererCode, traiterCorrection } from "@/features/eleves/actions";
import { PageBody, PageHeader } from "@/components/layout/page-header";
import { Card, CardHeader, Details, Note } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, Td, Th, LigneVide } from "@/components/ui/data-table";
import { Avatar } from "@/components/ui/avatar";
import { ActionButton } from "@/components/ui/action-button";
import { Dialog } from "@/components/ui/dialog";
import { ArchiveForm, ClasseForm, CorrectionForm } from "./dossier-forms";

export async function DossierEleve({ id, espace }: { id: string; espace: "direction" | "secretariat" }) {
  const [t, lang, e, classes, situation] = await Promise.all([getT(), getLang(), getEleve(id), listerClasses(), getSituation(id)]);
  if (!e) notFound();
  const secretariat = espace === "secretariat";
  const base = `/${lang}/${espace}/eleves`;

  return (
    <>
      <PageHeader titre={t("Dossier de l'élève", "Student file")} filAriane={[{ href: base, libelle: t("Élèves", "Students") }]} sousTitre={`${e.prenom} ${e.nom}`} />
      <PageBody>
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar nom={`${e.prenom} ${e.nom}`} taille="lg" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-xl font-bold text-navy-800">{e.prenom} {e.nom}</h2>
                  <Badge ton={e.dossierComplet ? "succes" : "alerte"}>{e.dossierComplet ? t("Dossier complet", "Complete file") : t("Dossier incomplet", "Incomplete file")}</Badge>
                  {e.statut === "sorti" && <Badge ton="danger">{t("Sorti", "Left")}</Badge>}
                  {e.redoublant && <Badge ton="alerte">{t("Redoublant", "Repeating")}</Badge>}
                </div>
                <p className="text-sm text-muted">{e.matricule} · {e.classe.libelle} · {t("Année", "Year")} 2026-2027</p>
              </div>
            </div>
            {secretariat && e.statut === "actif" && (
              <Dialog declencheur={t("Demander une correction", "Request a correction")} titre={t("Correction du dossier", "File correction")} variante="primaire" taille="md">
                <CorrectionForm action={demanderCorrection.bind(null, e.id)} />
              </Dialog>
            )}
          </div>
        </Card>

        <div className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <Card>
              <CardHeader titre={t("Identité", "Identity")} />
              <Details
                lignes={[
                  [t("Nom", "Last name"), e.nom],
                  [t("Prénom", "First name"), e.prenom],
                  [t("Sexe", "Sex"), e.sexe === "F" ? t("Féminin", "Female") : t("Masculin", "Male")],
                  [t("Date de naissance", "Date of birth"), dateCourte(e.dateNaissance, lang)],
                  [t("Lieu de naissance", "Place of birth"), e.lieuNaissance || "—"],
                  [t("Nationalité", "Nationality"), e.nationalite],
                  [t("Inscription", "Enrolment"), `${dateCourte(e.inscritLe, lang)} · ${e.typeInscription === "nouveau" ? t("Nouvel élève", "New student") : e.typeInscription === "reinscription" ? t("Réinscription", "Re-enrolment") : t("Transfert", "Transfer")}`],
                ]}
              />
            </Card>

            <Card>
              <CardHeader titre={t("Parent ou tuteur et accès", "Parent or guardian and access")} />
              <Table>
                <thead>
                  <tr>
                    <Th>{t("Tuteur", "Guardian")}</Th>
                    <Th>{t("Téléphone", "Phone")}</Th>
                    <Th>{t("Code de liaison", "Link code")}</Th>
                    <Th>{t("Statut", "Status")}</Th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <Td>
                      <span className="font-semibold">{e.tuteur.nom}</span>
                      <span className="block text-xs text-muted">{lib(LIEN_TUTEUR, e.tuteur.lien, t)}</span>
                    </Td>
                    <Td>{e.tuteur.telephone}</Td>
                    <Td className="font-mono">{secretariat ? e.codeLiaison : "•••• ••"}</Td>
                    <Td><Badge ton={ton(LIAISON, e.liaison)}>{lib(LIAISON, e.liaison, t)}</Badge></Td>
                  </tr>
                </tbody>
              </Table>
            </Card>

            <Card>
              <CardHeader titre={t("Historique des corrections", "Correction history")} />
              <Table>
                <thead>
                  <tr>
                    <Th>{t("Date", "Date")}</Th>
                    <Th>{t("Champ", "Field")}</Th>
                    <Th>{t("Ancienne valeur", "Old value")}</Th>
                    <Th>{t("Nouvelle valeur", "New value")}</Th>
                    <Th>{t("Statut", "Status")}</Th>
                  </tr>
                </thead>
                <tbody>
                  {e.corrections.length === 0 && <LigneVide colSpan={5} texte={t("Aucune correction.", "No corrections.")} />}
                  {e.corrections.map((c) => (
                    <tr key={c.id}>
                      <Td className="whitespace-nowrap">{jourMois(c.date, lang)}</Td>
                      <Td>{c.champ}</Td>
                      <Td className="text-muted">{c.ancienneValeur}</Td>
                      <Td className="font-medium">{c.nouvelleValeur}</Td>
                      <Td>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge ton={ton(STATUT_CORRECTION, c.statut)}>{lib(STATUT_CORRECTION, c.statut, t)}</Badge>
                          {espace === "direction" && c.statut === "attente_directeur" && (
                            <>
                              <ActionButton action={traiterCorrection.bind(null, c.id, "accepter")} variante="succes">{t("Valider", "Approve")}</ActionButton>
                              <ActionButton action={traiterCorrection.bind(null, c.id, "refuser")} variante="danger">{t("Refuser", "Reject")}</ActionButton>
                            </>
                          )}
                        </div>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </div>

          <div className="space-y-6">
            {secretariat && e.statut === "actif" && (
              <Card>
                <CardHeader titre={t("Actions", "Actions")} />
                <div className="flex flex-col gap-2">
                  <Link href={`${base}/${e.id}/fiche-liaison`} className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-navy-700 hover:bg-navy-50">
                    <Printer className="size-4" /> {t("Imprimer la fiche de liaison", "Print the link sheet")}
                  </Link>
                  <Link href={`${base}/${e.id}/certificat`} className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-navy-700 hover:bg-navy-50">
                    <FileText className="size-4" /> {t("Générer un certificat de scolarité", "Generate a school certificate")}
                  </Link>
                  <ActionButton action={regenererCode.bind(null, e.id)} variante="secondaire" taille="md" className="justify-start" confirmation={t("L'ancien code ne fonctionnera plus. Continuer ?", "The old code will stop working. Continue?")}>
                    <KeyRound className="size-4" /> {t("Régénérer le code de liaison", "Regenerate link code")}
                  </ActionButton>
                  <Dialog declencheur={t("Affecter ou transférer de classe", "Assign or transfer class")} titre={t("Changer de classe", "Change class")} taille="md">
                    <ClasseForm action={affecterClasse.bind(null, e.id)} classes={classes.map((c) => ({ id: c.id, libelle: `${c.libelle} (${c.effectif}/${c.capacite})` }))} actuelle={e.classeId} />
                  </Dialog>
                </div>
              </Card>
            )}

            {e.piecesManquantes.length > 0 && (
              <Card>
                <CardHeader titre={t("Pièces manquantes", "Missing documents")} />
                <ul className="space-y-2">
                  {e.piecesManquantes.map((p) => (
                    <li key={p} className="flex items-center justify-between gap-2 text-sm">
                      {p}
                      {secretariat && <ActionButton action={completerPiece.bind(null, e.id, p)} variante="succes">{t("Reçue", "Received")}</ActionButton>}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {situation && (
              <Card>
                <CardHeader titre={t("Situation financière", "Financial status")} action={<Wallet className="size-4 text-muted" />} />
                <Details
                  lignes={[
                    [t("Frais dus", "Fees due"), fcfa(situation.totalDu, lang)],
                    [t("Payé", "Paid"), fcfa(situation.paye, lang)],
                    [t("Solde", "Balance"), <span key="s" className={situation.montantEchu ? "text-red-600" : ""}>{fcfa(situation.solde, lang)}</span>],
                  ]}
                />
              </Card>
            )}

            <Note titre={t("Règle de délégation", "Delegation rule")}>
              {t("Les corrections d'identité (nom, naissance) sont envoyées au directeur pour validation avant d'être appliquées au dossier.", "Identity corrections (name, birth) are sent to the principal for approval before being applied to the file.")}
            </Note>

            {secretariat && e.statut === "actif" && (
              <Card>
                <CardHeader titre={t("Zone sensible", "Danger zone")} sousTitre={t("Élève sorti de l'établissement (CU-SEC-10).", "Student who left the school (CU-SEC-10).")} />
                <Dialog declencheur={t("Archiver ou clôturer le dossier", "Archive or close the file")} titre={t("Archiver le dossier", "Archive the file")} variante="danger">
                  <ArchiveForm action={archiverDossier.bind(null, e.id)} />
                </Dialog>
              </Card>
            )}
          </div>
        </div>
      </PageBody>
    </>
  );
}
