"use server";
// Actions « scolarité » (secrétariat ; validation des corrections d'identité par la direction).
import { refresh } from "next/cache";
import { ecrire } from "@/lib/api/client";
import { messageErreur } from "@/lib/api/errors";
import { exigerRole } from "@/lib/auth/dal";
import { getLangAction, getTAction } from "@/lib/i18n/server";
import { echec, erreursZod, lireFormulaire, type EtatFormulaire } from "@/lib/actions";
import * as m from "@/lib/api/mock/scolarite";
import { schemaCorrection, schemaInscription } from "./schemas";

export async function inscrireEleve(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("secretariat");
  const t = await getTAction();
  const res = schemaInscription.safeParse(lireFormulaire(fd));
  if (!res.success) return echec(t("Vérifiez les champs signalés.", "Please check the highlighted fields."), erreursZod(res.error));
  try {
    const r = await ecrire(() => m.inscrire(res.data, s.nomAffiche), "/eleves", "POST", res.data);
    refresh();
    return { ok: true, message: t(`Élève enregistré : matricule ${r.matricule}.`, `Student saved: ID ${r.matricule}.`), donnees: r };
  } catch (e) {
    return echec(messageErreur(e, await getLangAction()));
  }
}

export async function affecterClasse(eleveId: string, _: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("secretariat");
  const t = await getTAction();
  const classeId = String(fd.get("classeId") ?? "");
  try {
    await ecrire(() => m.affecterClasse(eleveId, classeId, s.nomAffiche), `/eleves/${eleveId}/classe`, "PUT", { classeId });
    refresh();
    return { ok: true, message: t("Classe mise à jour.", "Class updated.") };
  } catch (e) {
    return echec(messageErreur(e, await getLangAction()));
  }
}

export async function demanderCorrection(eleveId: string, _: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("secretariat");
  const t = await getTAction();
  const res = schemaCorrection.safeParse(lireFormulaire(fd));
  if (!res.success) return echec(t("Vérifiez les champs signalés.", "Please check the highlighted fields."), erreursZod(res.error));
  try {
    const r = await ecrire(() => m.demanderCorrection(eleveId, res.data.champ, res.data.valeur, s.nomAffiche), `/eleves/${eleveId}/corrections`, "POST", res.data);
    refresh();
    return {
      ok: true,
      message: r.identite
        ? t("Correction d'identité envoyée au directeur pour validation.", "Identity correction sent to the principal for approval.")
        : t("Correction appliquée et historisée.", "Correction applied and logged."),
    };
  } catch (e) {
    return echec(messageErreur(e, await getLangAction()));
  }
}

/** Secrétariat : accepter (ou transmettre au directeur) / refuser une demande de correction. */
export async function traiterCorrection(id: string, decision: "accepter" | "refuser") {
  const s = await exigerRole("secretariat", "direction");
  await ecrire(() => m.traiterCorrection(id, decision, s.nomAffiche, s.role === "direction"), `/corrections/${id}/${decision}`, "POST");
  refresh();
}

export async function completerPiece(eleveId: string, piece: string) {
  const s = await exigerRole("secretariat");
  await ecrire(() => m.completerPiece(eleveId, piece, s.nomAffiche), `/eleves/${eleveId}/pieces`, "POST", { piece });
  refresh();
}

export async function regenererCode(eleveId: string) {
  const s = await exigerRole("secretariat");
  await ecrire(() => m.regenererCode(eleveId, s.nomAffiche), `/eleves/${eleveId}/code-liaison`, "POST");
  refresh();
}

export async function archiverDossier(eleveId: string, _: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("secretariat");
  const t = await getTAction();
  const motif = String(fd.get("motif") ?? "").trim();
  if (!motif) return echec(t("Le motif de sortie est obligatoire.", "Exit reason is required."));
  await ecrire(() => m.archiver(eleveId, motif, s.nomAffiche), `/eleves/${eleveId}/sortie`, "POST", { motif });
  refresh();
  return { ok: true, message: t("Dossier archivé.", "File archived.") };
}

export async function reinscrire(eleveId: string, fd: FormData) {
  const s = await exigerRole("secretariat");
  const classeId = String(fd.get("classeId") ?? "");
  if (!classeId) return;
  await ecrire(() => m.reinscrire(eleveId, classeId, s.nomAffiche), `/reinscriptions`, "POST", { eleveId, classeId });
  refresh();
}

export async function importerEleves(_: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> {
  const s = await exigerRole("secretariat");
  const t = await getTAction();
  const etape = String(fd.get("etape") ?? "analyser");
  const fichier = fd.get("fichier");
  let contenu = String(fd.get("contenu") ?? "");
  if (fichier instanceof File && fichier.size > 0) {
    if (fichier.size > 2_000_000) return echec(t("Fichier trop volumineux (2 Mo max).", "File too large (2 MB max)."));
    contenu = await fichier.text();
  }
  if (!contenu.trim()) return echec(t("Choisissez un fichier CSV.", "Choose a CSV file."));
  if (etape === "analyser") {
    const lignes = m.analyserImport(contenu);
    return {
      ok: true,
      donnees: { contenu, lignes: JSON.stringify(lignes), nom: fichier instanceof File ? fichier.name : "import.csv" },
    };
  }
  try {
    const r = await ecrire(() => m.importer(contenu, s.nomAffiche), "/eleves/import", "POST", { contenu });
    refresh();
    return {
      ok: true,
      message: t(`${r.importes} élève(s) importé(s).`, `${r.importes} student(s) imported.`) + (r.doublons ? t(` ${r.doublons} doublon(s) ignoré(s).`, ` ${r.doublons} duplicate(s) skipped.`) : ""),
      donnees: { termine: 1 },
    };
  } catch (e) {
    return echec(messageErreur(e, await getLangAction()));
  }
}
