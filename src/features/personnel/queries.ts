import "server-only";
import { lire } from "@/lib/api/client";
import * as m from "@/lib/api/mock/personnel";

export const listerPersonnel = (f: m.FiltrePersonnel) => lire(() => m.listerPersonnel(f), "/personnel", f);
export const getMembre = (id: string) => lire(() => m.membre(id), `/personnel/${id}`);
export const prochainMatricule = () => lire(() => m.prochainMatricule(), "/personnel/prochain-matricule");
export const listerEnseignants = () => lire(() => m.enseignants(), "/personnel/enseignants");
