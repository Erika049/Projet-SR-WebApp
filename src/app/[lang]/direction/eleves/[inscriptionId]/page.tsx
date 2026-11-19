// Route : /[lang]/direction/eleves/[inscriptionId] — Dossier de l'élève (consultation + validation des corrections d'identité).
import { DossierEleve } from "@/features/eleves/components/dossier-eleve";

export default async function DossierElevePage({ params }: PageProps<"/[lang]/direction/eleves/[inscriptionId]">) {
  const { inscriptionId } = await params;
  return <DossierEleve id={inscriptionId} espace="direction" />;
}
