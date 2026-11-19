import "server-only";
import { lire } from "@/lib/api/client";
import * as m from "@/lib/api/mock/communication";
import type { Role } from "@/types/domain";

export const listerNotifications = (role: Role, filtre: "toutes" | "non_lues" | "archivees") => lire(() => m.listerNotifications(role, filtre), "/notifications", { filtre });
export const preferencesNotification = (userId: string, role: Role) => lire(() => m.preferences(userId, role), "/notifications/preferences");
