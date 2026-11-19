// Fonction sans équivalent dans le backend SchoolConnect : aucune donnée fictive n'est affichée.
import { Indisponible } from "@/components/layout/indisponible";

export default function Page() {
  return <Indisponible titre={["Support", "Support"]} fonction={["Le support (tickets)", "Support tickets"]} />;
}
