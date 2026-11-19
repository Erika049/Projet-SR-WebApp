// Base de données d'exemple, en mémoire, qui imite l'API Spring Boot.
// Les données reprennent les maquettes (Lycée bilingue de Bafoussam, Amina Etame…).
// Elle vit le temps du processus serveur : un redémarrage la réinitialise.
import "server-only";
import type {
  AnneeScolaire,
  Annonce,
  Appel,
  BulletinClasse,
  Classe,
  Correction,
  Declaration,
  DemandeLiaison,
  Eleve,
  EntreeAudit,
  Etablissement,
  EvenementCalendrier,
  Justificatif,
  Matiere,
  Notification,
  Paiement,
  ParametresEvaluation,
  Personnel,
  PreferencesNotification,
  PresencePersonnel,
  Relance,
  Remise,
  RetardSortie,
  Sequence,
  Tarif,
  Ticket,
  Trimestre,
  Utilisateur,
} from "@/types/domain";

export const ECOLE_ID = "etab-0001";
export const MOT_DE_PASSE_DEMO = "demo1234";

// ---------- Outils de dates (heure locale, format ISO sans fuseau) ----------
const pad = (n: number) => String(n).padStart(2, "0");
export function isoJour(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
export function aujourdhui() {
  return isoJour(new Date());
}
export function jour(decalage: number) {
  const d = new Date();
  d.setDate(d.getDate() + decalage);
  return isoJour(d);
}
export function instant(decalage: number, heure: string) {
  return `${jour(decalage)}T${heure}:00`;
}
export function maintenant() {
  const d = new Date();
  return `${isoJour(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

// Générateur pseudo-aléatoire déterministe (mêmes données à chaque démarrage)
function prng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

let compteurId = 1000;
export const nouvelId = (prefixe: string) => `${prefixe}-${++compteurId}`;

export type Db = ReturnType<typeof creerDb>;

function creerDb() {
  const rnd = prng(42);
  const pick = <T,>(arr: T[]) => arr[Math.floor(rnd() * arr.length)];

  // ---------- Établissements ----------
  const etablissements: Etablissement[] = [
    ["Lycée bilingue de Bafoussam", "Bafoussam", "Ouest", "standard", "actif", "2026-09-01", "2027-08-31", 0, "bilingue", "public"],
    ["Collège La Réussite · Douala", "Douala", "Littoral", "premium", "actif", "2025-12-01", "2026-11-28", 2310, "francophone", "prive_laic"],
    ["Lycée classique de Garoua", "Garoua", "Nord", "standard", "actif", "2025-12-04", "2026-12-03", 1540, "francophone", "public"],
    ["CES de Mvog-Ada · Yaoundé", "Yaoundé", "Centre", "standard", "actif", "2025-12-16", "2026-12-15", 980, "francophone", "public"],
    ["Collège Saint-Joseph · Bamenda", "Bamenda", "Nord-Ouest", "essai", "essai", "2026-10-10", "2026-12-09", 420, "anglophone", "prive_confessionnel"],
    ["Lycée technique de Ngaoundéré", "Ngaoundéré", "Adamaoua", "premium", "actif", "2026-09-01", "2027-08-31", 1760, "bilingue", "public"],
    ["Collège Les Palmiers · Kribi", "Kribi", "Sud", "standard", "expire", "2025-10-01", "2026-09-30", 610, "francophone", "prive_laic"],
    ["Lycée de Bertoua", "Bertoua", "Est", "essai", "suspendu", "2026-09-02", "2026-11-01", 305, "francophone", "public"],
    ["Lycée de Mbouda", "Mbouda", "Ouest", "standard", "actif", "2026-11-14", "2027-11-13", 870, "bilingue", "public"],
    ["Collège Saint-Jean · Edéa", "Edéa", "Littoral", "premium", "actif", "2026-08-20", "2027-08-19", 1130, "francophone", "prive_confessionnel"],
  ].map(([nom, ville, region, plan, statut, debut, fin, eleves, ss, type], i) => ({
    id: `etab-${pad(i + 1).padStart(4, "0")}`,
    code: `SC-${String(i + 1).padStart(4, "0")}`,
    nom: nom as string,
    ville: ville as string,
    region: region as string,
    type: type as Etablissement["type"],
    sousSysteme: ss as Etablissement["sousSysteme"],
    adresse: `BP ${100 + i * 37}, ${ville}`,
    telephone: `+237 6 ${70 + i} ${pad(10 + i)} ${pad(20 + i)} ${pad(30 + i)}`,
    email: `contact@${(ville as string).toLowerCase().replace(/[^a-z]/g, "")}-ecole.cm`,
    plan: plan as Etablissement["plan"],
    statut: statut as Etablissement["statut"],
    debutAbonnement: debut as string,
    finAbonnement: fin as string,
    effectifEleves: eleves as number,
    effectifPersonnel: Math.round((eleves as number) / 16) || 0,
    parentsLies: Math.round((eleves as number) * 0.85),
    nbClasses: Math.round((eleves as number) / 48) || 0,
    directeurId: null,
    creeLe: debut as string,
  }));

  // ---------- Classes ----------
  const defsClasses: [string, string, Classe["cycle"]][] = [
    ["6e A", "6e", "premier"], ["6e B", "6e", "premier"], ["5e A", "5e", "premier"], ["5e B", "5e", "premier"],
    ["4e A", "4e", "premier"], ["4e B", "4e", "premier"], ["3e A", "3e", "premier"], ["3e B", "3e", "premier"],
    ["2nde C", "2nde", "second"], ["1ère D", "1ère", "second"], ["Tle C", "Tle", "second"], ["Tle D", "Tle", "second"],
  ];
  const classes: Classe[] = defsClasses.map(([libelle, niveau, cycle], i) => ({
    id: `cls-${i + 1}`,
    libelle,
    niveau,
    cycle,
    capacite: cycle === "premier" ? 60 : 55,
    titulaireId: null,
    sousSysteme: "francophone",
  }));
  const classeParLibelle = (l: string) => classes.find((c) => c.libelle === l)!;

  // ---------- Matières ----------
  const matieres: Matiere[] = [
    ["MATH", "Mathématiques", 1, 4, 5], ["FRAN", "Français", 1, 4, 3], ["ANG", "Anglais", 1, 3, 3],
    ["HG", "Histoire-Géographie", 2, 2, 2], ["PC", "Physique-Chimie", 1, 2, 4], ["SVT", "SVT", 1, 2, 4],
    ["ECM", "Éducation civique", 2, 1, 1], ["INFO", "Informatique", 2, 2, 2], ["ALL", "Allemand", 2, 2, 2],
    ["PHILO", "Philosophie", 2, 0, 2], ["EPS", "EPS", 3, 1, 1],
  ].map(([code, libelle, groupe, c1, c2]) => ({
    id: `mat-${(code as string).toLowerCase()}`,
    code: code as string,
    libelle: libelle as string,
    groupe: groupe as 1 | 2 | 3,
    coefficientPremierCycle: c1 as number,
    coefficientSecondCycle: c2 as number,
  }));

  // ---------- Personnel ----------
  type P = [string, "M." | "Mme", string, string, Personnel["fonction"], string, string[], Personnel["statut"]];
  const defsPersonnel: P[] = [
    ["PER-0001", "M.", "Joseph", "Kamga", "enseignant", "Mathématiques", ["3e A", "3e B", "4e A"], "actif"],
    ["PER-0002", "Mme", "Hélène", "Nguemo", "enseignant", "Français", ["3e A", "4e B", "5e A"], "actif"],
    ["PER-0003", "M.", "Eric", "Tabi", "enseignant", "Anglais", ["6e A", "6e B", "5e B"], "actif"],
    ["PER-0004", "Mme", "Odile", "Fouda", "enseignant", "Histoire-Géographie", ["3e A", "2nde C"], "conge"],
    ["PER-0005", "M.", "Luc", "Essomba", "enseignant", "Physique-Chimie", ["3e B", "1ère D"], "actif"],
    ["PER-0006", "Mme", "Berthe", "Ndongo", "enseignant", "SVT", ["6e A", "5e A"], "actif"],
    ["PER-0007", "M.", "Yves", "Mballa", "enseignant", "EPS", ["4e A", "4e B"], "suspendu"],
    ["PER-0008", "M.", "Serge", "Ngono", "enseignant", "Informatique", ["2nde C", "1ère D", "Tle C"], "actif"],
    ["PER-0009", "Mme", "Claire", "Abena", "enseignant", "Allemand", ["4e A", "3e B"], "actif"],
    ["PER-0010", "M.", "Paul", "Bekolo", "enseignant", "Philosophie", ["Tle C", "Tle D"], "actif"],
    ["PER-0011", "Mme", "Rita", "Atangana", "enseignant", "Éducation civique", ["6e B", "5e B"], "actif"],
    ["PER-0065", "M.", "Emmanuel", "Owona", "surveillant_general", "Vie scolaire", [], "actif"],
    ["PER-0071", "Mme", "Julienne", "Tchoua", "secretaire", "Secrétariat", [], "actif"],
    ["PER-0074", "Mme", "Marthe", "Biloa", "comptable", "Comptabilité", [], "actif"],
    ["PER-0080", "M.", "Pierre", "Nkeng", "directeur", "Direction", [], "actif"],
    ["PER-0087", "M.", "Alain", "Mbarga", "enseignant", "Mathématiques", ["3e A", "3e B", "4e A", "4e B"], "actif"],
  ];
  const categorie = (f: Personnel["fonction"]): Personnel["categorie"] =>
    f === "enseignant" ? "enseignant" : f.startsWith("surveillant") ? "surveillance" : "administration";
  const personnel: Personnel[] = defsPersonnel.map(([matricule, civ, prenom, nom, fonction, specialite, cls, statut], i) => {
    const heures = cls.length * 5;
    const prevues = fonction === "enseignant" ? heures * 4 : 0;
    const absences = nom === "Essomba" ? 2 : 0;
    return {
      id: `per-${i + 1}`,
      matricule,
      civilite: civ,
      prenom,
      nom,
      sexe: civ === "M." ? "M" : "F",
      dateNaissance: `19${70 + (i % 20)}-${pad((i % 12) + 1)}-${pad((i % 27) + 1)}`,
      telephone: `+237 6 77 ${pad(10 + i)} ${pad(20 + i)} ${pad(30 + i)}`,
      email: `${prenom[0].toLowerCase()}.${nom.toLowerCase()}@lycee-bafoussam.cm`,
      fonction,
      categorie: categorie(fonction),
      specialite,
      contrat: i % 4 === 3 ? "vacataire" : "permanent",
      datePriseService: i === 15 ? "2026-09-07" : `20${10 + (i % 12)}-09-0${(i % 7) + 1}`,
      heuresSemaine: fonction === "enseignant" ? heures : 40,
      statut,
      congeJusquau: statut === "conge" ? "2026-11-30" : null,
      affectations: cls.map((c) => ({ classeId: classeParLibelle(c).id, matiere: specialite, heures: c.startsWith("4") && nom === "Mbarga" ? 4 : 5 })),
      compte: {
        acces: fonction === "enseignant" ? "mobile" : "web",
        invitation: i === 8 ? "envoyee" : "acceptee",
        derniereConnexion: statut === "suspendu" ? "2026-10-02T10:12:00" : instant(i % 3 === 0 ? 0 : -1, `07:${pad(30 + i)}`),
      },
      assiduiteMois: {
        heuresPrevues: prevues,
        heuresEffectuees: statut === "conge" ? Math.round(prevues * 0.43) : prevues - absences * 3 - (nom === "Ndongo" ? 1 : 0),
        retards: nom === "Essomba" ? 2 : nom === "Kamga" || nom === "Ndongo" ? 1 : 0,
        absences,
        absencesNonJustifiees: absences,
      },
    };
  });
  const per = (nom: string) => personnel.find((p) => p.nom === nom)!;
  const titulaires: Record<string, string> = { "6e A": "Nguemo", "6e B": "Tabi", "5e A": "Kamga", "4e B": "Ndongo", "3e A": "Mbarga", "2nde C": "Essomba", "1ère D": "Fouda", "Tle C": "Bekolo" };
  for (const [c, n] of Object.entries(titulaires)) classeParLibelle(c).titulaireId = per(n).id;

  // ---------- Utilisateurs ----------
  const utilisateurs: (Utilisateur & { motDePasse: string })[] = [
    { id: "usr-admin", civilite: "Mme", prenom: "Carole", nom: "Fonkou", email: "admin@schoolconnect.cm", telephone: "+237 690 000 001", role: "super_admin", etablissementId: null, statut: "actif", derniereConnexion: instant(0, "08:02"), langue: "fr", motDePasse: MOT_DE_PASSE_DEMO },
    { id: "usr-nkeng", civilite: "M.", prenom: "Pierre", nom: "Nkeng", email: "p.nkeng@lycee-bafoussam.cm", telephone: "+237 690 000 002", role: "direction", etablissementId: ECOLE_ID, statut: "actif", derniereConnexion: instant(0, "07:48"), langue: "fr", personnelId: per("Nkeng").id, motDePasse: MOT_DE_PASSE_DEMO },
    { id: "usr-tchoua", civilite: "Mme", prenom: "Julienne", nom: "Tchoua", email: "j.tchoua@lycee-bafoussam.cm", telephone: "+237 690 000 003", role: "secretariat", etablissementId: ECOLE_ID, statut: "actif", derniereConnexion: instant(0, "07:52"), langue: "fr", personnelId: per("Tchoua").id, motDePasse: MOT_DE_PASSE_DEMO },
    { id: "usr-owona", civilite: "M.", prenom: "Emmanuel", nom: "Owona", email: "e.owona@lycee-bafoussam.cm", telephone: "+237 690 000 004", role: "surveillant", etablissementId: ECOLE_ID, statut: "actif", derniereConnexion: instant(0, "07:30"), langue: "fr", personnelId: per("Owona").id, motDePasse: MOT_DE_PASSE_DEMO },
    { id: "usr-biloa", civilite: "Mme", prenom: "Marthe", nom: "Biloa", email: "m.biloa@lycee-bafoussam.cm", telephone: "+237 690 000 005", role: "comptable", etablissementId: ECOLE_ID, statut: "actif", derniereConnexion: instant(-1, "16:10"), langue: "fr", personnelId: per("Biloa").id, motDePasse: MOT_DE_PASSE_DEMO },
    // Directeurs des autres établissements (plateforme)
    { id: "usr-bello", civilite: "Mme", prenom: "Aïcha", nom: "Bello", email: "a.bello@lycee-garoua.cm", telephone: "+237 690 000 010", role: "direction", etablissementId: "etab-0003", statut: "actif", derniereConnexion: instant(-1, "09:00"), langue: "fr", motDePasse: MOT_DE_PASSE_DEMO },
    { id: "usr-eyenga", civilite: "M.", prenom: "Samuel", nom: "Eyenga", email: "s.eyenga@lareussite.cm", telephone: "+237 690 000 011", role: "direction", etablissementId: "etab-0002", statut: "invite", derniereConnexion: null, langue: "fr", motDePasse: MOT_DE_PASSE_DEMO },
    { id: "usr-mballa", civilite: "M.", prenom: "Yves", nom: "Mballa", email: "y.mballa@palmiers-kribi.cm", telephone: "+237 690 000 012", role: "direction", etablissementId: "etab-0007", statut: "verrouille", derniereConnexion: "2026-09-28T11:00:00", langue: "fr", motDePasse: MOT_DE_PASSE_DEMO },
    { id: "usr-support", civilite: "M.", prenom: "Bruno", nom: "Ekane", email: "support@schoolconnect.cm", telephone: "+237 690 000 900", role: "super_admin", etablissementId: null, statut: "actif", derniereConnexion: instant(0, "08:30"), langue: "fr", motDePasse: MOT_DE_PASSE_DEMO },
  ];
  etablissements[0].directeurId = "usr-nkeng";
  etablissements[1].directeurId = "usr-eyenga";
  etablissements[2].directeurId = "usr-bello";
  etablissements[6].directeurId = "usr-mballa";

  // ---------- Élèves ----------
  const noms = ["Etame", "Fotso", "Mbarga", "Njoya", "Tchoumi", "Kenfack", "Nkou", "Tagne", "Ngo Bayiha", "Essama", "Djoko", "Manga", "Tsafack", "Nana", "Kouam", "Ebode", "Moukoko", "Simo", "Wandji", "Ateba", "Fokou", "Nlend", "Mvondo", "Dongmo", "Abessolo", "Toko", "Kameni", "Ngassa"];
  const prenomsF = ["Amina", "Carine", "Estelle", "Grace", "Sandra", "Laure", "Prisca", "Nadège", "Christelle", "Marthe", "Brenda", "Joëlle", "Aurore", "Ruth"];
  const prenomsM = ["Boris", "David", "Franck", "Hervé", "Joël", "Kevin", "Arnaud", "Cédric", "Ulrich", "Steve", "Junior", "Yannick", "Loïc", "Fabrice"];
  const villes = ["Bafoussam", "Dschang", "Douala", "Yaoundé", "Mbouda", "Foumban", "Bangangté"];
  const tuteurPrenoms = ["Madeleine", "Paul", "Rose", "Jean", "Alice", "Marie", "Victor", "Sylvie", "Thérèse", "Emmanuel", "Odette", "Martin"];

  const eleves: Eleve[] = [];
  let numero = 1;
  const anneeNaissance = (niveau: string) => ({ "6e": 2015, "5e": 2014, "4e": 2013, "3e": 2012, "2nde": 2011, "1ère": 2010, Tle: 2009 })[niveau] ?? 2012;
  const ajouter = (e: Partial<Eleve> & { nom: string; prenom: string; sexe: "M" | "F"; classe: string }) => {
    const c = classeParLibelle(e.classe);
    const id = `elv-${numero}`;
    const matricule = e.matricule ?? `BAF-26-${String(numero).padStart(4, "0")}`;
    numero++;
    const tp = pick(tuteurPrenoms);
    const r = rnd();
    eleves.push({
      id,
      matricule,
      nom: e.nom,
      prenom: e.prenom,
      sexe: e.sexe,
      dateNaissance: e.dateNaissance ?? `${anneeNaissance(c.niveau)}-${pad(1 + Math.floor(rnd() * 12))}-${pad(1 + Math.floor(rnd() * 27))}`,
      lieuNaissance: pick(villes),
      nationalite: "Camerounaise",
      classeId: c.id,
      redoublant: e.redoublant ?? r < 0.06,
      statut: "actif",
      typeInscription: rnd() < 0.7 ? "reinscription" : "nouveau",
      inscritLe: `2026-0${8 + Math.floor(rnd() * 2)}-${pad(1 + Math.floor(rnd() * 27))}`,
      piecesManquantes: e.piecesManquantes ?? (rnd() < 0.12 ? ["Acte de naissance"] : []),
      tuteur: e.tuteur ?? { nom: `${tp} ${e.nom}`, telephone: `+237 6 ${pad(50 + Math.floor(rnd() * 49))} ${pad(Math.floor(rnd() * 99))} ${pad(Math.floor(rnd() * 99))} ${pad(Math.floor(rnd() * 99))}`, lien: rnd() < 0.5 ? "mere" : "pere" },
      codeLiaison: `SC-${Math.floor(rnd() * 36 ** 4).toString(36).toUpperCase().padStart(4, "0")}-${pad(Math.floor(rnd() * 99))}`,
      liaison: e.liaison ?? (r < 0.85 ? "liee" : r < 0.92 ? "en_attente" : "non_liee"),
      remiseId: e.remiseId ?? null,
    });
  };
  // Élèves nommés des maquettes
  ajouter({ nom: "Etame", prenom: "Amina", sexe: "F", classe: "3e A", dateNaissance: "2012-03-12", liaison: "liee", tuteur: { nom: "Madeleine Etame", telephone: "+237 6 77 12 34 56", lien: "mere" }, piecesManquantes: [], redoublant: false });
  ajouter({ nom: "Fotso", prenom: "Boris", sexe: "M", classe: "3e A", liaison: "liee", tuteur: { nom: "Paul Fotso", telephone: "+237 6 99 45 12 78", lien: "pere" }, piecesManquantes: [], redoublant: false });
  ajouter({ nom: "Mbarga", prenom: "Carine", sexe: "F", classe: "3e A", liaison: "en_attente", tuteur: { nom: "Rose Mbarga", telephone: "+237 6 55 32 10 44", lien: "mere" }, piecesManquantes: [], redoublant: false });
  ajouter({ nom: "Njoya", prenom: "David", sexe: "M", classe: "4e B", liaison: "liee", redoublant: true, tuteur: { nom: "Jean Njoya", telephone: "+237 6 70 88 21 09", lien: "pere" }, piecesManquantes: [] });
  ajouter({ nom: "Tchoumi", prenom: "Estelle", sexe: "F", classe: "2nde C", liaison: "non_liee", tuteur: { nom: "Alice Tchoumi", telephone: "+237 6 91 14 52 33", lien: "mere" }, piecesManquantes: ["Bulletin antérieur"], redoublant: false });
  ajouter({ nom: "Kenfack", prenom: "Franck", sexe: "M", classe: "6e A", liaison: "liee", tuteur: { nom: "Marie Kenfack", telephone: "+237 6 76 40 11 20", lien: "mere" }, piecesManquantes: [], redoublant: false });
  ajouter({ nom: "Nkou", prenom: "Grace", sexe: "F", classe: "5e B", liaison: "liee", tuteur: { nom: "Victor Nkou", telephone: "+237 6 98 02 76 31", lien: "pere" }, piecesManquantes: ["Certificat médical"], redoublant: false, remiseId: "rem-fratrie" });
  ajouter({ nom: "Tagne", prenom: "Hervé", sexe: "M", classe: "1ère D", liaison: "non_liee", redoublant: true, tuteur: { nom: "Sylvie Tagne", telephone: "+237 6 79 63 25 14", lien: "mere" }, piecesManquantes: ["Photo d'identité"] });
  // Autres élèves générés
  for (const c of classes) {
    const n = 9 + Math.floor(rnd() * 4);
    for (let i = 0; i < n; i++) {
      const f = rnd() < 0.5;
      ajouter({ nom: pick(noms), prenom: f ? pick(prenomsF) : pick(prenomsM), sexe: f ? "F" : "M", classe: c.libelle });
    }
  }
  const elv = (prenom: string) => eleves.slice(0, 8).find((e) => e.prenom === prenom)!;

  // ---------- Année et périodes ----------
  const annee: AnneeScolaire = { libelle: "2026-2027", debut: "2026-09-07", fin: "2027-06-30", statut: "en_cours", regime: "trimestriel" };
  const trimestres: Trimestre[] = [
    { id: "tri-1", numero: 1, debut: "2026-09-07", fin: "2026-12-18", statut: "en_cours" },
    { id: "tri-2", numero: 2, debut: "2027-01-04", fin: "2027-03-26", statut: "a_venir" },
    { id: "tri-3", numero: 3, debut: "2027-04-06", fin: "2027-06-30", statut: "a_venir" },
  ];
  const sequences: Sequence[] = [
    { numero: 1, trimestre: 1, debut: "2026-09-07", fin: "2026-10-16", statut: "saisie_ouverte", saisieJusquau: "2026-11-20" },
    { numero: 2, trimestre: 1, debut: "2026-10-19", fin: "2026-12-18", statut: "a_venir", saisieJusquau: null },
    { numero: 3, trimestre: 2, debut: "2027-01-04", fin: "2027-02-12", statut: "a_venir", saisieJusquau: null },
    { numero: 4, trimestre: 2, debut: "2027-02-15", fin: "2027-03-26", statut: "a_venir", saisieJusquau: null },
    { numero: 5, trimestre: 3, debut: "2027-04-06", fin: "2027-05-14", statut: "a_venir", saisieJusquau: null },
    { numero: 6, trimestre: 3, debut: "2027-05-17", fin: "2027-06-30", statut: "a_venir", saisieJusquau: null },
  ];
  const calendrier: EvenementCalendrier[] = [
    { id: "cal-1", libelle: "Rentrée scolaire", debut: "2026-09-07", fin: "2026-09-07", type: "evenement" },
    { id: "cal-2", libelle: "Compositions de la séquence 1", debut: "2026-10-12", fin: "2026-10-16", type: "examen" },
    { id: "cal-3", libelle: "Réunion des parents d'élèves", debut: "2026-11-21", fin: "2026-11-21", type: "evenement" },
    { id: "cal-4", libelle: "Compositions de la séquence 2", debut: "2026-12-07", fin: "2026-12-11", type: "examen" },
    { id: "cal-5", libelle: "Congés de Noël", debut: "2026-12-19", fin: "2027-01-03", type: "conge" },
    { id: "cal-6", libelle: "Fête de la Jeunesse", debut: "2027-02-11", fin: "2027-02-11", type: "conge" },
    { id: "cal-7", libelle: "Congés de Pâques", debut: "2027-03-27", fin: "2027-04-05", type: "conge" },
  ];
  const evaluation: ParametresEvaluation = { bareme: 20, seuilReussite: 10, seuilTableauHonneur: 12, seuilAvertissement: 8, decimales: 2, delaiJustificationHeures: 48 };

  // ---------- Bulletins (séquence 1) ----------
  const statutsBulletins: [number, BulletinClasse["statut"]][] = [[100, "publie"], [100, "a_valider"], [100, "publie"], [91, "incomplet"], [100, "valide"], [64, "incomplet"], [100, "publie"], [100, "a_valider"], [100, "a_valider"], [78, "incomplet"], [100, "a_valider"], [100, "valide"]];
  const bulletins: BulletinClasse[] = classes.flatMap((c, i) => [
    { classeId: c.id, sequence: 1, progression: statutsBulletins[i][0], statut: statutsBulletins[i][1] },
    { classeId: c.id, sequence: 2, progression: Math.floor(rnd() * 30), statut: "incomplet" as const },
  ]);

  // ---------- Vie scolaire ----------
  const appels: Appel[] = [];
  for (const c of classes) {
    if (c.libelle === "2nde C") continue; // « Appel non fait »
    const statuts: Appel["statuts"] = {};
    for (const e of eleves.filter((x) => x.classeId === c.id)) {
      const r = rnd();
      statuts[e.id] = r < 0.05 ? "absent" : r < 0.08 ? "retard" : "present";
    }
    appels.push({ id: nouvelId("apl"), classeId: c.id, date: aujourdhui(), realisePar: "Enseignant", statuts });
  }
  const tauxSemaine = [93.1, 94.0, 93.6, 96.2, 94.8, 92.7];

  const justificatifs: Justificatif[] = [
    { id: "jus-1", eleveId: elv("Amina").id, dateAbsence: jour(-9), heures: "08 h – 09 h", motif: "Consultation médicale", piece: "certificat.pdf", statut: "en_attente", soumisLe: instant(-8, "18:20"), traitePar: null },
    { id: "jus-2", eleveId: elv("David").id, dateAbsence: jour(-9), heures: "10 h – 11 h", motif: "Raison familiale", piece: "lettre.jpg", statut: "en_attente", soumisLe: instant(-8, "19:02"), traitePar: null },
    { id: "jus-3", eleveId: elv("Franck").id, dateAbsence: jour(-13), heures: "08 h", motif: "Transport", piece: null, statut: "en_attente", soumisLe: instant(-12, "07:45"), traitePar: null },
    { id: "jus-4", eleveId: elv("Grace").id, dateAbsence: jour(-16), heures: "10 h 15", motif: "Rendez-vous médical", piece: "ordonnance.pdf", statut: "en_attente", soumisLe: instant(-15, "12:10"), traitePar: null },
    { id: "jus-5", eleveId: eleves[20].id, dateAbsence: jour(-3), heures: "Journée", motif: "Maladie", piece: "certificat.pdf", statut: "en_attente", soumisLe: instant(-2, "08:00"), traitePar: null },
    { id: "jus-6", eleveId: eleves[33].id, dateAbsence: jour(-20), heures: "Matinée", motif: "Deuil familial", piece: null, statut: "accepte", soumisLe: instant(-19, "09:00"), traitePar: "M. Owona" },
    { id: "jus-7", eleveId: eleves[41].id, dateAbsence: jour(-22), heures: "14 h – 16 h", motif: "Sans motif précis", piece: null, statut: "refuse", soumisLe: instant(-21, "17:30"), traitePar: "M. Owona" },
  ];

  const retardsSorties: RetardSortie[] = [
    { id: "rs-1", eleveId: elv("David").id, date: aujourdhui(), heure: "08:15", type: "retard", motif: "Transport" },
    { id: "rs-2", eleveId: elv("Boris").id, date: aujourdhui(), heure: "08:40", type: "retard", motif: "Réveil tardif" },
    { id: "rs-3", eleveId: elv("Hervé").id, date: aujourdhui(), heure: "11:40", type: "sortie", motif: "Rendez-vous médical" },
    { id: "rs-4", eleveId: elv("Estelle").id, date: aujourdhui(), heure: "12:10", type: "sortie", motif: "Appel des parents" },
    { id: "rs-5", eleveId: elv("David").id, date: jour(-1), heure: "07:55", type: "retard", motif: "Transport" },
    { id: "rs-6", eleveId: elv("David").id, date: jour(-2), heure: "08:05", type: "retard", motif: "Transport" },
  ];

  const presencesPersonnel: Record<string, Record<string, PresencePersonnel>> = {
    [aujourdhui()]: Object.fromEntries(personnel.filter((p) => p.statut === "actif").map((p) => [p.id, p.nom === "Essomba" ? "A" : "P"])),
  };

  // ---------- Demandes ----------
  const demandesLiaison: DemandeLiaison[] = [
    ["Mme Madeleine Etame", "Amina"], ["M. Paul Fotso", "Boris"], ["Mme Rose Mbarga", "Carine"],
    ["M. Jean Njoya", "David"], ["Mme Alice Tchoumi", "Estelle"], ["Mme Sylvie Tagne", "Hervé"],
  ].map(([parent, prenom], i) => ({
    id: `dl-${i + 1}`,
    parentNom: parent,
    parentTelephone: elv(prenom).tuteur.telephone,
    eleveId: elv(prenom).id,
    date: instant(-i, "09:30"),
    statut: "en_attente" as const,
  }));
  const corrections: Correction[] = [
    { id: "cor-1", eleveId: elv("Amina").id, champ: "Classe", ancienneValeur: "3e B", nouvelleValeur: "3e A", identite: false, statut: "appliquee", date: "2026-09-03T10:00:00", demandeur: "Mme Tchoua" },
    { id: "cor-2", eleveId: elv("Amina").id, champ: "Téléphone du tuteur", ancienneValeur: "+237 6XX XXX 000", nouvelleValeur: "+237 6 77 12 34 56", identite: false, statut: "appliquee", date: "2026-09-04T11:20:00", demandeur: "Mme Tchoua" },
    { id: "cor-3", eleveId: elv("Amina").id, champ: "Date de naissance", ancienneValeur: "12/03/2012", nouvelleValeur: "21/03/2012", identite: true, statut: "attente_directeur", date: instant(-3, "10:10"), demandeur: "Mme Tchoua" },
    { id: "cor-4", eleveId: elv("Estelle").id, champ: "Nom", ancienneValeur: "Tchoumi", nouvelleValeur: "Tchoumy", identite: true, statut: "a_traiter", date: instant(-1, "15:00"), demandeur: "Mme Alice Tchoumi (parent)" },
    { id: "cor-5", eleveId: elv("David").id, champ: "Date de naissance", ancienneValeur: "04/06/2013", nouvelleValeur: "14/06/2013", identite: true, statut: "attente_directeur", date: instant(-2, "09:00"), demandeur: "Mme Tchoua" },
    { id: "cor-6", eleveId: elv("Grace").id, champ: "Téléphone du tuteur", ancienneValeur: elv("Grace").tuteur.telephone, nouvelleValeur: "+237 6 98 02 76 99", identite: false, statut: "a_traiter", date: instant(-1, "11:40"), demandeur: "M. Victor Nkou (parent)" },
  ];

  // ---------- Finances ----------
  const tarifs: Tarif[] = [
    ["6e", 100000, 2], ["5e", 100000, 2], ["4e", 110000, 2], ["3e", 120000, 2], ["2nde", 130000, 3], ["1ère", 140000, 3], ["Tle", 150000, 3],
  ].map(([niveau, montant, n]) => {
    const m = montant as number;
    const versements =
      n === 2
        ? [
            { libelle: "1er versement", montant: Math.round((m * 0.625) / 5000) * 5000, dateLimite: "2026-09-15" },
            { libelle: "2e versement", montant: m - Math.round((m * 0.625) / 5000) * 5000, dateLimite: "2026-11-30" },
          ]
        : [
            { libelle: "1er versement", montant: Math.round(m / 2 / 5000) * 5000, dateLimite: "2026-09-15" },
            { libelle: "2e versement", montant: Math.round(m / 4 / 5000) * 5000, dateLimite: "2026-11-15" },
            { libelle: "3e versement", montant: m - Math.round(m / 2 / 5000) * 5000 - Math.round(m / 4 / 5000) * 5000, dateLimite: "2027-01-31" },
          ];
    return { niveau: niveau as string, montant: m, versements };
  });
  const remises: Remise[] = [
    { id: "rem-fratrie", libelle: "Fratrie (2e enfant)", taux: 10 },
    { id: "rem-personnel", libelle: "Enfant du personnel", taux: 50 },
    { id: "rem-integral", libelle: "Paiement intégral en septembre", taux: 5 },
  ];

  const paiements: Paiement[] = [];
  let recu = 100;
  const modes: Paiement["mode"][] = ["mtn_momo", "mtn_momo", "orange_money", "especes", "especes"];
  const encaisser = (eleveId: string, montant: number, mode: Paiement["mode"], date: string, canal: Paiement["canal"] = "guichet") =>
    paiements.push({
      id: nouvelId("pai"),
      numeroRecu: `REÇU-2026-${String(++recu).padStart(4, "0")}`,
      eleveId,
      montant,
      mode,
      reference: mode === "especes" ? "" : `${mode === "mtn_momo" ? "MP" : mode === "orange_money" ? "OM" : "VIR"}26${String(1000 + recu)}`,
      date,
      encaissePar: "Mme Biloa",
      canal,
      statut: "valide",
      motifAnnulation: null,
    });
  const niveauDe = (e: Eleve) => classes.find((c) => c.id === e.classeId)!.niveau;
  const nommes = new Set(["Amina", "Boris", "Carine", "David", "Estelle", "Franck", "Grace", "Hervé"].map((p) => elv(p).id));
  for (const e of eleves) {
    if (nommes.has(e.id)) continue;
    const t = tarifs.find((x) => x.niveau === niveauDe(e))!;
    const r = rnd();
    if (r < 0.12) continue; // impayé total
    const v1 = t.versements[0].montant;
    const partiel = r < 0.22;
    encaisser(e.id, partiel ? Math.round(v1 / 2 / 5000) * 5000 : v1, pick(modes), `2026-09-${pad(1 + Math.floor(rnd() * 28))}T${pad(8 + Math.floor(rnd() * 8))}:${pad(Math.floor(rnd() * 60))}:00`);
    if (!partiel && r > 0.55) encaisser(e.id, t.versements[1].montant, pick(modes), `2026-10-${pad(1 + Math.floor(rnd() * 30))}T${pad(8 + Math.floor(rnd() * 8))}:${pad(Math.floor(rnd() * 60))}:00`);
  }
  // Paiements des élèves nommés
  encaisser(elv("Amina").id, 75000, "especes", "2026-09-05T09:20:00");
  encaisser(elv("Boris").id, 75000, "especes", "2026-09-08T10:00:00");
  encaisser(elv("Carine").id, 15000, "mtn_momo", "2026-09-20T11:00:00");
  encaisser(elv("Franck").id, 10000, "especes", "2026-09-10T09:00:00");
  encaisser(elv("Grace").id, 30000, "mtn_momo", "2026-09-12T14:00:00");
  encaisser(elv("Estelle").id, 20000, "especes", "2026-09-14T08:30:00");
  // Hervé Tagne et David Njoya n'ont rien payé (plus gros impayés des maquettes)
  // Paiements du jour (tableau de bord comptable)
  encaisser(elv("Franck").id, 50000, "especes", instant(0, "09:10"));
  encaisser(elv("Boris").id, 30000, "orange_money", instant(0, "10:32"));
  encaisser(elv("Grace").id, 60000, "especes", instant(0, "11:05"));
  encaisser(eleves[30].id, 45000, "mtn_momo", instant(0, "08:45"));
  encaisser(eleves[44].id, 50000, "especes", instant(0, "08:20"));

  const declarations: Declaration[] = [
    { id: "dec-1", parentNom: "Madeleine Etame", eleveId: elv("Amina").id, montant: 45000, mode: "mtn_momo", reference: "MP261112.1530.A21", date: instant(0, "07:15"), statut: "en_attente" },
    { id: "dec-2", parentNom: "Rose Mbarga", eleveId: elv("Carine").id, montant: 60000, mode: "orange_money", reference: "OM261110.1042.B07", date: instant(-1, "19:42"), statut: "en_attente" },
    { id: "dec-3", parentNom: "Jean Njoya", eleveId: elv("David").id, montant: 20000, mode: "virement", reference: "VIR-2026-1108", date: instant(-8, "10:00"), statut: "en_attente" },
  ];
  const relances: Relance[] = [
    { id: "rel-1", eleveId: elv("David").id, date: "2026-11-02T10:00:00", canal: "sms" },
    { id: "rel-2", eleveId: elv("Hervé").id, date: "2026-11-05T10:00:00", canal: "sms" },
  ];

  // ---------- Communication ----------
  const annonces: Annonce[] = [
    { id: "ann-1", titre: "Réunion des parents d'élèves", message: "Les parents sont convoqués le samedi 21 novembre à 9 h, salle polyvalente, pour la remise des bulletins du premier trimestre.", type: "convocation", cible: "tous_parents", classeIds: [], canaux: ["sms", "push"], auteurRole: "direction", statut: "publiee", date: instant(-1, "08:00") },
    { id: "ann-2", titre: "Calendrier des compositions", message: "Les compositions de la séquence 2 auront lieu du 7 au 11 décembre.", type: "annonce", cible: "classe", classeIds: classes.filter((c) => ["3e", "2nde", "1ère", "Tle"].includes(c.niveau)).map((c) => c.id), canaux: ["push"], auteurRole: "direction", statut: "publiee", date: instant(-3, "10:00") },
    { id: "ann-3", titre: "Retards répétés en 4e B", message: "Nous constatons des retards répétés en 4e B. Merci de veiller à la ponctualité de vos enfants.", type: "annonce", cible: "classe", classeIds: [classeParLibelle("4e B").id], canaux: ["sms", "push"], auteurRole: "surveillant", statut: "publiee", date: instant(-4, "12:00") },
    { id: "ann-4", titre: "Fermeture exceptionnelle", message: "L'établissement sera fermé le vendredi pour cause de travaux.", type: "annonce", cible: "parents_enseignants", classeIds: [], canaux: ["sms", "email", "push"], auteurRole: "direction", statut: "publiee", date: instant(-7, "16:00") },
    { id: "ann-5", titre: "Nouveaux horaires du vendredi", message: "À partir de la semaine prochaine, les cours du vendredi se terminent à 15 h 30.", type: "annonce", cible: "parents_enseignants", classeIds: [], canaux: ["push"], auteurRole: "surveillant", statut: "publiee", date: instant(-9, "09:00") },
    { id: "ann-6", titre: "Remise des bulletins", message: "Les bulletins de la séquence 1 seront disponibles dans l'application.", type: "annonce", cible: "tous_parents", classeIds: [], canaux: ["push"], auteurRole: "direction", statut: "programmee", date: instant(6, "08:00") },
    { id: "ann-7", titre: "Horaires du vendredi", message: "Rappel : les élèves doivent être présents à 7 h 30.", type: "annonce", cible: "parents_enseignants", classeIds: [], canaux: ["push"], auteurRole: "surveillant", statut: "brouillon", date: instant(0, "07:00") },
  ];

  const n = (role: Notification["role"], type: string, titre: string, message: string, date: string, lue = false, lien?: string): Notification => ({ id: nouvelId("ntf"), role, type, titre, message, date, lue, archivee: false, lien });
  const notifications: Notification[] = [
    n("super_admin", "ticket", "Ticket urgent", "Lycée classique de Garoua : impossible d'envoyer les bulletins", instant(0, "09:12"), false, "/plateforme/support"),
    n("super_admin", "abonnement", "Abonnement expirant", "Collège La Réussite expire dans 7 jours", instant(0, "08:40"), false, "/plateforme/abonnements"),
    n("super_admin", "etablissement", "Nouvel établissement", "Lycée de Mbouda a accepté l'invitation du directeur", instant(-1, "15:00")),
    n("super_admin", "ticket", "Bug signalé", "M. Nkeng (Bafoussam) : export PDF des bulletins", instant(-1, "11:00")),
    n("super_admin", "abonnement", "Paiement d'abonnement échoué", "Collège Saint-Jean · carte refusée", instant(-3, "10:00")),
    n("super_admin", "securite", "Connexion inhabituelle", "Compte support · nouvel appareil", instant(-5, "22:10"), true),
    n("direction", "bulletin", "Bulletins à valider", "4 classes attendent votre validation", instant(0, "08:00"), false, "/direction/notes-bulletins"),
    n("direction", "correction", "Corrections d'identité", "2 corrections attendent votre validation", instant(0, "07:50"), false, "/direction/utilisateurs"),
    n("direction", "finance", "Impayés critiques", "12 élèves ont plus de 30 jours de retard", instant(-1, "17:00"), false, "/direction/finances"),
    n("direction", "personnel", "Enseignant absent", "M. Essomba n'a pas pris son cours de 8 h", instant(0, "08:10"), false, "/direction/assiduite-personnel"),
    n("direction", "annonce", "Annonce publiée", "Retards répétés en 4e B · Surveillant général", instant(-4, "12:00"), true),
    n("secretariat", "liaison", "Demande de liaison", "Mme Alice Tchoumi souhaite lier son compte à Estelle Tchoumi", instant(0, "10:05"), false, "/secretariat/demandes"),
    n("secretariat", "correction", "Correction acceptée", "Le directeur a validé la date de naissance de David Njoya", instant(0, "09:30")),
    n("secretariat", "correction", "Nouvelles demandes", "3 demandes de correction en attente", instant(0, "08:50"), false, "/secretariat/demandes"),
    n("secretariat", "dossier", "Dossier incomplet", "Grace Nkou · 5e B : pièce manquante", instant(-1, "14:00")),
    n("secretariat", "annonce", "Annonce publiée", "Réunion des parents d'élèves · Direction", instant(-1, "08:00"), true),
    n("secretariat", "import", "Import terminé", "eleves-3eA.csv · 48 lignes importées", instant(-2, "16:00"), true),
    n("surveillant", "justificatif", "Justificatifs reçus", "5 nouveaux justificatifs d'absence de parents", instant(0, "10:12"), false, "/surveillance/justificatifs"),
    n("surveillant", "personnel", "Enseignant absent", "M. Essomba n'a pas pris son cours de 8 h", instant(0, "08:10"), false, "/surveillance/assiduite-personnel"),
    n("surveillant", "retard", "Retards répétés", "David Njoya · 4e B : 3 retards cette semaine", instant(0, "07:55"), false, "/surveillance/retards-sorties"),
    n("surveillant", "signalement", "Signalement enseignant", "Mme Nguemo signale 2 absents en 3e A", instant(-1, "09:00")),
    n("surveillant", "absence", "Absences non justifiées", "12 élèves dépassent le délai de 48 h", instant(-1, "17:00")),
    n("surveillant", "annonce", "Annonce de la direction", "Calendrier des compositions", instant(-3, "10:00")),
    n("comptable", "declaration", "Déclaration de paiement", "Mme Madeleine Etame · 45 000 FCFA · MTN MoMo", instant(0, "07:15"), false, "/comptabilite/declarations"),
    n("comptable", "declaration", "Déclaration de paiement", "Mme Rose Mbarga · 60 000 FCFA · Orange Money", instant(-1, "19:42"), false, "/comptabilite/declarations"),
    n("comptable", "impaye", "Impayé critique", "David Njoya · 4e B : 35 jours de retard", instant(-1, "08:00"), false, "/comptabilite/impayes"),
    n("comptable", "caisse", "Rappel de clôture de caisse", "Pensez à clôturer la caisse d'hier", instant(-2, "17:30"), true),
    n("comptable", "tarif", "Modification des tarifs", "La direction a mis à jour l'échéancier de 3e", instant(-7, "10:00"), true),
  ];
  const preferences: Record<string, PreferencesNotification> = {};

  // ---------- Plateforme : tickets et audit ----------
  const tickets: Ticket[] = [
    { id: "tck-1042", numero: 1042, etablissementId: "etab-0003", objet: "Impossible d'envoyer les bulletins", type: "bug", module: "Notes et bulletins", priorite: "urgent", statut: "ouvert", creeLe: instant(0, "08:41"), auteur: "Responsable des études", messages: [
      { auteur: "Responsable des études", support: false, date: instant(0, "08:41"), texte: "Bonjour, depuis ce matin l'envoi des bulletins aux parents échoue. Le message affiche une erreur." },
      { auteur: "Support SchoolConnect", support: true, date: instant(0, "08:55"), texte: "Bonjour, merci du signalement. Nous vérifions le journal d'envoi de votre école." },
      { auteur: "Responsable des études", support: false, date: instant(0, "09:02"), texte: "Merci, les parents attendent les bulletins du premier trimestre." },
    ] },
    { id: "tck-1041", numero: 1041, etablissementId: "etab-0002", objet: "Code de liaison expiré", type: "question", module: "Élèves", priorite: "normal", statut: "ouvert", creeLe: instant(0, "08:00"), auteur: "Secrétariat", messages: [{ auteur: "Secrétariat", support: false, date: instant(0, "08:00"), texte: "Un parent indique que son code de liaison a expiré. Comment le régénérer ?" }] },
    { id: "tck-1040", numero: 1040, etablissementId: "etab-0005", objet: "Erreur à l'import des élèves", type: "bug", module: "Élèves", priorite: "urgent", statut: "ouvert", creeLe: instant(0, "06:00"), auteur: "Secrétariat", messages: [{ auteur: "Secrétariat", support: false, date: instant(0, "06:00"), texte: "L'import CSV s'arrête à la ligne 12." }] },
    { id: "tck-1039", numero: 1039, etablissementId: "etab-0004", objet: "Question sur la facturation", type: "question", module: "Abonnement", priorite: "normal", statut: "ouvert", creeLe: instant(-1, "15:00"), auteur: "Direction", messages: [{ auteur: "Direction", support: false, date: instant(-1, "15:00"), texte: "Comment est calculé le montant de l'abonnement Standard ?" }] },
    { id: "tck-1038", numero: 1038, etablissementId: ECOLE_ID, objet: "Ajouter une classe de Terminale", type: "demande", module: "Paramétrage", priorite: "faible", statut: "ouvert", creeLe: instant(-1, "10:00"), auteur: "M. Nkeng", messages: [{ auteur: "M. Nkeng", support: false, date: instant(-1, "10:00"), texte: "Nous souhaitons ouvrir une Terminale D supplémentaire." }] },
    { id: "tck-1030", numero: 1030, etablissementId: ECOLE_ID, objet: "Import CSV : accents mal affichés", type: "bug", module: "Élèves", priorite: "normal", statut: "resolu", creeLe: "2026-11-04T10:00:00", auteur: "Mme Tchoua", messages: [{ auteur: "Mme Tchoua", support: false, date: "2026-11-04T10:00:00", texte: "Les accents sont remplacés par des symboles." }, { auteur: "Support SchoolConnect", support: true, date: "2026-11-04T14:00:00", texte: "Enregistrez le fichier en UTF-8 ; c'est corrigé de notre côté aussi." }] },
  ];
  const audit: EntreeAudit[] = [
    { id: "aud-1", etablissementId: ECOLE_ID, date: instant(0, "09:42"), acteur: "Mme Biloa", action: "Paiement enregistré", cible: "Amina Etame · 45 000 FCFA" },
    { id: "aud-2", etablissementId: ECOLE_ID, date: instant(0, "09:15"), acteur: "M. Owona", action: "Justificatif validé", cible: "Grace Nkou · 5e B" },
    { id: "aud-3", etablissementId: ECOLE_ID, date: instant(0, "08:50"), acteur: "Mme Tchoua", action: "Classe corrigée", cible: "Amina Etame · 3e B → 3e A" },
    { id: "aud-4", etablissementId: ECOLE_ID, date: instant(0, "08:20"), acteur: "Direction", action: "Bulletins publiés", cible: "6e A" },
    { id: "aud-5", etablissementId: ECOLE_ID, date: instant(-1, "16:00"), acteur: "Direction", action: "Compte suspendu", cible: "M. Mballa" },
    { id: "aud-p1", etablissementId: "etab-0003", date: instant(0, "09:20"), acteur: "C. Fonkou", action: "Accès support (lecture seule)", cible: "Lycée classique de Garoua" },
    { id: "aud-p2", etablissementId: "etab-0003", date: instant(0, "09:02"), acteur: "C. Fonkou", action: "Ticket #1042 répondu", cible: "Lycée classique de Garoua" },
    { id: "aud-p3", etablissementId: "etab-0008", date: instant(0, "08:30"), acteur: "Support", action: "Établissement suspendu", cible: "Lycée de Bertoua" },
    { id: "aud-p4", etablissementId: "etab-0001", date: instant(-1, "17:44"), acteur: "Support", action: "Mot de passe réinitialisé", cible: "Lycée bilingue de Bafoussam" },
    { id: "aud-p5", etablissementId: "etab-0002", date: instant(-1, "15:10"), acteur: "C. Fonkou", action: "Abonnement prolongé", cible: "Collège La Réussite · Douala" },
    { id: "aud-p6", etablissementId: "etab-0009", date: instant(-1, "11:05"), acteur: "C. Fonkou", action: "Établissement créé", cible: "Lycée de Mbouda" },
  ];

  // Effectifs de l'école de démonstration = données réelles
  etablissements[0].effectifEleves = eleves.length;
  etablissements[0].effectifPersonnel = personnel.length;
  etablissements[0].nbClasses = classes.length;
  etablissements[0].parentsLies = eleves.filter((e) => e.liaison === "liee").length;

  return {
    etablissements, utilisateurs, classes, matieres, personnel, eleves, annee, trimestres, sequences, calendrier, evaluation,
    bulletins, appels, tauxSemaine, justificatifs, retardsSorties, presencesPersonnel, demandesLiaison, corrections,
    tarifs, remises, paiements, declarations, relances, annonces, notifications, preferences, tickets, audit,
    reinscriptions: {} as Record<string, { classeId: string; date: string }>,
    cloturesCaisse: [] as { date: string; especes: number; mobile: number; autres: number; par: string; le: string }[],
    prochainRecu: () => `REÇU-2026-${String(++recu).padStart(4, "0")}`,
    prochainMatriculeEleve: () => `BAF-26-${String(numero++).padStart(4, "0")}`,
  };
}

const g = globalThis as unknown as { __schoolconnectDb?: Db };
export function db(): Db {
  if (!g.__schoolconnectDb) g.__schoolconnectDb = creerDb();
  return g.__schoolconnectDb;
}

export function journaliser(etablissementId: string | null, acteur: string, action: string, cible: string) {
  db().audit.unshift({ id: nouvelId("aud"), etablissementId, date: maintenant(), acteur, action, cible });
}

export function notifier(role: Notification["role"], type: string, titre: string, message: string, lien?: string) {
  db().notifications.unshift({ id: nouvelId("ntf"), role, type, titre, message, date: maintenant(), lue: false, archivee: false, lien });
}
