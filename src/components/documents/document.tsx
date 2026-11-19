import { BookOpen } from "lucide-react";
import { PrintButton } from "./print-button";

/** Gabarit A4 des documents officiels imprimables (certificat, fiche de liaison, reçu). */
export function DocumentOfficiel({
  etablissement,
  titre,
  reference,
  children,
  libelleImprimer,
  actions,
}: {
  etablissement: { nom: string; adresse: string; telephone: string; email: string };
  titre: string;
  reference?: string;
  children: React.ReactNode;
  libelleImprimer: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <PrintButton libelle={libelleImprimer} />
        {actions}
      </div>
      <article className="document-imprimable mx-auto max-w-[210mm] rounded-2xl border border-line bg-white p-10 shadow-sm">
        <header className="flex items-start justify-between border-b-2 border-navy-700 pb-4">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-xl bg-navy-700 text-white">
              <BookOpen className="size-6" />
            </span>
            <div>
              <p className="text-lg font-bold text-navy-800">{etablissement.nom}</p>
              <p className="text-xs text-muted">{etablissement.adresse} · {etablissement.telephone} · {etablissement.email}</p>
            </div>
          </div>
          <p className="text-right text-[10px] leading-tight text-muted">
            République du Cameroun
            <br />
            Paix – Travail – Patrie
            <br />
            MINESEC
          </p>
        </header>
        <h1 className="mt-8 text-center text-xl font-bold uppercase tracking-wide text-navy-800">{titre}</h1>
        {reference && <p className="mt-1 text-center text-xs text-muted">{reference}</p>}
        <div className="mt-8 text-sm leading-relaxed">{children}</div>
        <footer className="mt-12 border-t border-line pt-3 text-center text-[10px] text-muted">Document généré par SchoolConnect · L&apos;école, plus proche de vous.</footer>
      </article>
    </div>
  );
}
