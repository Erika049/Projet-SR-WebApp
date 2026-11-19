"use client";
// CU-SEC-07 : importer des élèves en masse (CSV). Étapes : Fichier → Aperçu et contrôle → Import.
import Link from "next/link";
import { useActionState } from "react";
import { CheckCircle2, Download } from "lucide-react";
import { importerEleves } from "@/features/eleves/actions";
import { ETAT_INITIAL } from "@/lib/actions";
import { useLang, useT } from "@/lib/i18n/client";
import type { LigneImport } from "@/lib/api/mock/scolarite";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, Td, Th } from "@/components/ui/data-table";
import { FileDropzone } from "@/components/ui/file-dropzone";
import { FormMessage } from "@/components/ui/form-message";
import { Stepper } from "@/components/ui/stepper";
import { SubmitButton } from "@/components/ui/submit-button";
import { classesBouton } from "@/components/ui/button";

export function ImportForm() {
  const t = useT();
  const lang = useLang();
  const [etat, action] = useActionState(importerEleves, ETAT_INITIAL);
  const lignes: LigneImport[] = etat.donnees?.lignes ? JSON.parse(String(etat.donnees.lignes)) : [];
  const termine = etat.donnees?.termine === 1;
  const etape = termine ? 3 : lignes.length ? 2 : 1;
  const valides = lignes.filter((l) => !l.probleme);
  const erreurs = lignes.filter((l) => l.probleme);

  const telechargerRapport = () => {
    const csv = ["ligne;nom;prenom;classe;probleme", ...erreurs.map((l) => `${l.ligne};${l.nom};${l.prenom};${l.classe};${l.probleme}`)].join("\n");
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "rapport-erreurs-import.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <Stepper etapes={[t("Fichier", "File"), t("Aperçu et contrôle", "Preview and checks"), t("Import", "Import")]} courante={etape} />
      <FormMessage etat={etat} />

      {etape === 1 && (
        <form action={action} className="grid gap-6 xl:grid-cols-[2fr_1fr]">
          <Card>
            <CardHeader titre={t("Fichier", "File")} />
            <input type="hidden" name="etape" value="analyser" />
            <FileDropzone name="fichier" accept=".csv,text/csv" libelle={t("Choisir un fichier CSV", "Choose a CSV file")} aide={t("Séparateur ; ou , · encodage UTF-8 · 2 Mo max", "Separator ; or , · UTF-8 · 2 MB max")} />
            <div className="mt-4"><SubmitButton>{t("Analyser le fichier", "Analyse the file")}</SubmitButton></div>
          </Card>
          <Card className="h-fit text-sm">
            <CardHeader titre={t("Format attendu", "Expected format")} />
            <p className="text-muted">{t("Colonnes : nom, prénom, date de naissance (JJ/MM/AAAA), sexe (M/F), classe, nom et téléphone du tuteur.", "Columns: last name, first name, date of birth (DD/MM/YYYY), sex (M/F), class, guardian name and phone.")}</p>
            <a href="/modele-import-eleves.csv" download className={`${classesBouton("secondaire", "sm")} mt-4`}>
              <Download className="size-4" /> {t("Télécharger le modèle", "Download the template")}
            </a>
          </Card>
        </form>
      )}

      {etape === 2 && (
        <Card>
          <CardHeader
            titre={t("Aperçu et contrôle", "Preview and checks")}
            sousTitre={`${String(etat.donnees?.nom ?? "")} · ${t(`${lignes.length} lignes détectées`, `${lignes.length} rows detected`)}`}
            action={
              <>
                <Badge ton="succes">{t(`${valides.length} lignes valides`, `${valides.length} valid rows`)}</Badge>
                {erreurs.length > 0 && <Badge ton="danger">{t(`${erreurs.length} erreurs`, `${erreurs.length} errors`)}</Badge>}
              </>
            }
          />
          <p className="mb-3 text-sm text-muted">{t("Les lignes en erreur ne sont pas importées. Corrigez le fichier puis réimportez-les.", "Rows with errors are not imported. Fix the file and re-import them.")}</p>
          <Table>
            <thead>
              <tr>
                <Th>{t("Ligne", "Row")}</Th>
                <Th>{t("Nom", "Name")}</Th>
                <Th>{t("Classe", "Class")}</Th>
                <Th>{t("Contrôle", "Check")}</Th>
              </tr>
            </thead>
            <tbody>
              {[...erreurs, ...valides].slice(0, 30).map((l) => (
                <tr key={l.ligne}>
                  <Td>{l.ligne}</Td>
                  <Td className="font-semibold">{l.nom} {l.prenom}</Td>
                  <Td>{l.classe}</Td>
                  <Td>{l.probleme ? <Badge ton="danger">{l.probleme}</Badge> : <Badge ton="succes">{t("Valide", "Valid")}</Badge>}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
          <form action={action} className="mt-4 flex flex-wrap justify-end gap-2">
            <input type="hidden" name="etape" value="importer" />
            <input type="hidden" name="contenu" value={String(etat.donnees?.contenu ?? "")} />
            {erreurs.length > 0 && (
              <button type="button" onClick={telechargerRapport} className={classesBouton("secondaire")}>
                <Download className="size-4" /> {t("Télécharger le rapport d'erreurs", "Download the error report")}
              </button>
            )}
            <Link href={`/${lang}/secretariat/eleves/import`} className={classesBouton("fantome")}>{t("Choisir un autre fichier", "Choose another file")}</Link>
            <SubmitButton variante="succes" className={valides.length ? "" : "pointer-events-none opacity-50"}>
              {t(`Importer les ${valides.length} lignes valides`, `Import the ${valides.length} valid rows`)}
            </SubmitButton>
          </form>
        </Card>
      )}

      {etape === 3 && (
        <Card className="text-center">
          <CheckCircle2 className="mx-auto size-12 text-brand-600" />
          <p className="mt-3 text-lg font-bold text-navy-800">{t("Import terminé", "Import complete")}</p>
          <p className="text-sm text-muted">{t("Les codes de liaison des nouveaux élèves sont disponibles dans leurs dossiers.", "New students' link codes are available in their files.")}</p>
          <Link href={`/${lang}/secretariat/eleves`} className={`${classesBouton("primaire")} mt-4`}>{t("Voir les élèves", "See students")}</Link>
        </Card>
      )}
    </div>
  );
}
