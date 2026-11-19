// Les frais de scolarité se gèrent dans « Frais de scolarité ».
import { redirect } from "next/navigation";
import { getLang } from "@/lib/i18n/server";

export default async function Page() {
  redirect(`/${await getLang()}/direction/tarifs`);
}
