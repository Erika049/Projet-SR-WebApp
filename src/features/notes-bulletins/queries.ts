import "server-only";
import { lire } from "@/lib/api/client";
import * as m from "@/lib/api/mock/notes";

export const suiviBulletins = (vue: "sequence" | "trimestre", numero: number) => lire(() => m.suiviBulletins(vue, numero), "/bulletins/suivi", { vue, numero });
export const apercuBulletins = (classeId: string, sequence: number) => lire(() => m.apercuBulletins(classeId, sequence), `/bulletins/classes/${classeId}`, { sequence });
