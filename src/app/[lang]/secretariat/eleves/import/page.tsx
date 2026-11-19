// Fonction sans équivalent dans le backend SchoolConnect : aucune donnée fictive n'est affichée.
import { Indisponible } from "@/components/layout/indisponible";

export default function Page() {
  return <Indisponible titre={["Import d'élèves", "Student import"]} fonction={["L'import d'élèves par fichier", "Student file import"]} />;
}
