// Fonction sans équivalent dans le backend : retour au paramétrage de l'année.
import { redirect } from "next/navigation";
import { getLang } from "@/lib/i18n/server";

export default async function Page() {
  redirect(`/${await getLang()}/direction/parametrage`);
}
