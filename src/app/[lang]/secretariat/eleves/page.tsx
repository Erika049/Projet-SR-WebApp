// Route : /[lang]/secretariat/eleves — Répertoire des élèves de l'année courante (backend SchoolConnect).
import { ElevesList } from "@/features/eleves/components/eleves-list";

export default function Page({ searchParams }: PageProps<"/[lang]/secretariat/eleves">) {
  return <ElevesList espace="secretariat" searchParams={searchParams} />;
}