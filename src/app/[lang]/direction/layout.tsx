// Espace direction (CU-DIR-*) : contrôle du rôle « direction » puis menu latéral.
import { AppShell } from "@/components/layout/app-shell";

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AppShell roles={["direction"]}>{children}</AppShell>;
}
