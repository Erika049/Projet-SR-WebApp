// Route : /[lang]/direction/eleves — Répertoire des élèves de l'année courante (backend SchoolConnect).
import { ElevesList } from "@/features/eleves/components/eleves-list";

export default function Page({ searchParams }: PageProps<"/[lang]/direction/eleves">) {
  return <ElevesList espace="direction" searchParams={searchParams} />;
}