// Session chiffrée/signée dans un cookie httpOnly (JWT HS256 via jose).
import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import type { Locale, Role } from "@/types/domain";

export const COOKIE_SESSION = "sc_session";
const DUREE_SECONDES = 60 * 60 * 10; // 10 h : une journée de travail

export type Session = {
  userId: string;
  role: Role;
  etablissementId: string | null;
  etablissementNom: string | null;
  nomAffiche: string;
  initiales: string;
  langue: Locale;
  /** Jetons de l'API Spring Boot (absents en mode données d'exemple). */
  accessToken?: string;
  refreshToken?: string;
};

function cle() {
  const secret = process.env.SESSION_SECRET ?? "dev-only-secret-change-me-dev-only-secret";
  return new TextEncoder().encode(secret);
}

export async function createSession(data: Session) {
  const token = await new SignJWT(data)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${DUREE_SECONDES}s`)
    .sign(cle());
  (await cookies()).set(COOKIE_SESSION, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DUREE_SECONDES,
  });
}

export async function getSession(): Promise<Session | null> {
  const token = (await cookies()).get(COOKIE_SESSION)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify<Session>(token, cle());
    return payload;
  } catch {
    return null;
  }
}

export async function deleteSession() {
  (await cookies()).delete(COOKIE_SESSION);
}
