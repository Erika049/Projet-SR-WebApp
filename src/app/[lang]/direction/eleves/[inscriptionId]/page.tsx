// Route : /[lang]/direction/eleves/[inscriptionId] — Dossier de l'élève (le paramètre est l'identifiant de l'élève).
import { DossierEleve } from "@/features/eleves/components/dossier-eleve";
import { premier } from "@/lib/utils";

export default async function Page({ params, searchParams }: PageProps<"/[lang]/direction/eleves/[inscriptionId]">) {
  const [{ inscriptionId }, sp] = await Promise.all([params, searchParams]);
  return <DossierEleve eleveId={inscriptionId} espace="direction" inscrit={premier(sp.inscrit) === "1"} />;
}