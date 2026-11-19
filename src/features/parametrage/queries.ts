import "server-only";
import { lire } from "@/lib/api/client";
import * as m from "@/lib/api/mock/scolarite";

export type { ClasseDetaillee } from "@/lib/api/mock/scolarite";
export const parametrage = () => lire(() => m.parametrage(), "/parametrage");
export const listerClasses = () => lire(() => m.listerClasses(), "/classes");
export const getClasse = (id: string) => lire(() => m.classe(id), `/classes/${id}`);
