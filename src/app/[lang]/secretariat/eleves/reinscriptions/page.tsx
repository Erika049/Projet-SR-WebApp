// Fonction sans équivalent dans le backend SchoolConnect : aucune donnée fictive n'est affichée.
import { Indisponible } from "@/components/layout/indisponible";

export default function Page() {
  return <Indisponible titre={["Réinscriptions", "Re-enrolments"]} fonction={["La réinscription d'une année sur l'autre", "Year-to-year re-enrolment"]} />;
}
