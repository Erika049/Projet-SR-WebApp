// Menus latéraux par espace. Chaque entrée correspond à un écran branché sur le backend SchoolConnect.
import {
  BookOpen, Building2, ClipboardCheck, FileCheck2, FileText, GraduationCap, Home, Inbox, LayoutDashboard, Megaphone,
  Receipt, School, Search, Settings2, Tag, TimerReset, Users, Wallet, AlertTriangle, BarChart3,
} from "lucide-react";
import type { Espace } from "@/lib/auth/roles";

export type CleBadge = "demandes" | "justificatifs" | "declarations" | "impayes" | "appels";

export type EntreeMenu = {
  href: string; // sans préfixe de langue
  libelle: [fr: string, en: string];
  icone: React.ComponentType<{ className?: string }>;
  badge?: CleBadge;
};

export const NAVIGATION: Record<Espace, EntreeMenu[]> = {
  plateforme: [
    { href: "/plateforme", libelle: ["Vue d'ensemble", "Overview"], icone: LayoutDashboard },
    { href: "/plateforme/etablissements", libelle: ["Établissements", "Schools"], icone: Building2 },
  ],
  direction: [
    { href: "/direction", libelle: ["Tableau de bord", "Dashboard"], icone: LayoutDashboard },
    { href: "/direction/eleves", libelle: ["Élèves", "Students"], icone: GraduationCap },
    { href: "/direction/classes", libelle: ["Classes", "Classes"], icone: School },
    { href: "/direction/personnel", libelle: ["Personnel", "Staff"], icone: Users },
    { href: "/direction/notes-bulletins", libelle: ["Notes et résultats", "Marks and results"], icone: BookOpen },
    { href: "/direction/finances", libelle: ["Finances", "Finance"], icone: Wallet },
    { href: "/direction/tarifs", libelle: ["Frais de scolarité", "School fees"], icone: Tag },
    { href: "/direction/annonces", libelle: ["Annonces", "Announcements"], icone: Megaphone },
    { href: "/direction/parametrage", libelle: ["Paramétrage", "Settings"], icone: Settings2 },
  ],
  secretariat: [
    { href: "/secretariat", libelle: ["Accueil", "Home"], icone: Home },
    { href: "/secretariat/eleves", libelle: ["Élèves", "Students"], icone: GraduationCap },
    { href: "/secretariat/demandes", libelle: ["Demandes de liaison", "Link requests"], icone: Inbox, badge: "demandes" },
    { href: "/secretariat/annonces", libelle: ["Annonces", "Announcements"], icone: Megaphone },
  ],
  surveillance: [
    { href: "/surveillance", libelle: ["Tableau de bord", "Dashboard"], icone: LayoutDashboard },
    { href: "/surveillance/presences", libelle: ["Présences", "Attendance"], icone: ClipboardCheck, badge: "appels" },
    { href: "/surveillance/justificatifs", libelle: ["Justificatifs", "Absence notes"], icone: FileCheck2, badge: "justificatifs" },
    { href: "/surveillance/retards-sorties", libelle: ["Retards et sorties", "Lates and exits"], icone: TimerReset },
    { href: "/surveillance/annonces", libelle: ["Annonces", "Announcements"], icone: Megaphone },
  ],
  comptabilite: [
    { href: "/comptabilite", libelle: ["Tableau de bord", "Dashboard"], icone: LayoutDashboard },
    { href: "/comptabilite/paiements/nouveau", libelle: ["Enregistrer un paiement", "Record a payment"], icone: Receipt },
    { href: "/comptabilite/declarations", libelle: ["Déclarations", "Declarations"], icone: FileText, badge: "declarations" },
    { href: "/comptabilite/situation", libelle: ["Situation élève", "Student account"], icone: Search },
    { href: "/comptabilite/impayes", libelle: ["Impayés", "Arrears"], icone: AlertTriangle, badge: "impayes" },
    { href: "/comptabilite/rapports", libelle: ["Caisse et rapports", "Cash and reports"], icone: BarChart3 },
  ],
};
