// Route : /[lang]/secretariat/eleves/[inscriptionId] — Dossier de l'élève.
// CU-SEC-03 (affecter/transférer), CU-SEC-04 (code de liaison), CU-SEC-06 (corrections), CU-SEC-08 (documents), CU-SEC-10 (archivage).
import { DossierEleve } from "@/features/eleves/components/dossier-eleve";

export default async function DossierElevePage({ params }: PageProps<"/[lang]/secretariat/eleves/[inscriptionId]">) {
  const { inscriptionId } = await params;
  return <DossierEleve id={inscriptionId} espace="secretariat" />;
}
