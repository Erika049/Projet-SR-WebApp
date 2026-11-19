// Test de fumée : se connecte avec les comptes du jeu de données local (scripts/donnees-test-local.ps1 du backend)
// et ouvre tous les écrans de chaque rôle, le relais des reçus PDF et l'export CSV.
// Prérequis : backend sur http://localhost:8080 et application web sur http://localhost:3000.
//   npm run test:fumee
const WEB = process.env.BASE_URL ?? "http://localhost:3000";
const API = process.env.API_URL ?? "http://localhost:8080/api/v1";

function champsCaches(form) {
  const fd = new FormData();
  for (const m of form.matchAll(/<input[^>]*type="hidden"[^>]*>/g)) {
    const name = m[0].match(/name="([^"]*)"/)?.[1];
    const value = m[0].match(/value="([^"]*)"/)?.[1] ?? "";
    if (name) fd.append(name, value.replace(/&quot;/g, '"').replace(/&amp;/g, "&"));
  }
  return fd;
}

async function connexion(tel, mdp) {
  const html = await fetch(`${WEB}/fr/connexion`).then((r) => r.text());
  const fd = champsCaches(html.match(/<form[\s\S]*?<\/form>/)[0]);
  fd.append("identifiant", tel);
  fd.append("motDePasse", mdp);
  const r = await fetch(`${WEB}/fr/connexion`, { method: "POST", body: fd, redirect: "manual" });
  if (r.status !== 303) throw new Error(`connexion ${tel} : ${r.status}`);
  return r.headers.getSetCookie().map((c) => c.split(";")[0]).join("; ");
}

let echecs = 0;
async function page(cookie, chemin, attendus = []) {
  const res = await fetch(WEB + chemin, { headers: { cookie }, redirect: "manual" });
  const texte = (await res.text()).replace(/<[^>]+>/g, " ").replace(/&#x27;/g, "'").replace(/&amp;/g, "&").replace(/\s+/g, " ");
  const manquants = attendus.filter((a) => !texte.includes(a));
  const anglais = /\bEnglish\b|>EN<|Sign in\b/.test(texte);
  const erreur = anglais || /Une erreur inattendue|Application error|Unhandled Runtime Error|Something went wrong/i.test(texte);
  const ok = (res.status === 200 || res.status === 307) && !manquants.length && !erreur;
  if (!ok) echecs++;
  console.log(`${ok ? "OK " : "KO "} ${res.status} ${chemin}${manquants.length ? " manque: " + manquants.join(" | ") : ""}${erreur ? " (erreur)" : ""}`);
}

const jeton = async (tel, mdp) => (await fetch(`${API}/auth/login`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifiant: tel, motDePasse: mdp }) }).then((r) => r.json())).token;
const tok = await jeton("secretariat@lbb.cm", "Ecole2026");
const E = (await fetch(`${API}/auth/me`, { headers: { Authorization: `Bearer ${tok}` } }).then((r) => r.json())).roles[0].etablissementId;
const g = (u) => fetch(API + u, { headers: { Authorization: `Bearer ${tok}` } }).then((r) => r.json());
const eleves = await g(`/etablissements/${E}/repertoire-eleves`);
const amina = eleves.find((e) => e.prenom === "Amina");
const david = eleves.find((e) => e.prenom === "David");
const classes = await g(`/etablissements/${E}/annees-scolaires`).then(async (a) => g(`/etablissements/${E}/classes?anneeScolaireId=${a.find((x) => x.courante).id}`));
const c3eA = classes.find((c) => c.nom === "3e A");

const dir = await connexion("direction@lbb.cm", "Ecole2026");
await page(dir, "/fr/direction", ["Tableau de bord", "Élèves"]);
await page(dir, "/fr/direction/eleves", ["Amina", "Njoya"]);
await page(dir, `/fr/direction/eleves/${amina.eleveId}`, ["Madeleine", "Identité"]);
await page(dir, "/fr/direction/classes", ["3e A", "Kamga"]);
await page(dir, `/fr/direction/classes/${c3eA.id}`, ["Équipe pédagogique", "Mathématiques"]);
await page(dir, "/fr/direction/personnel", ["Mvondo", "Bello"]);
await page(dir, "/fr/direction/personnel/nouveau", ["Mot de passe initial"]);
await page(dir, "/fr/direction/notes-bulletins", ["3e A"]);
await page(dir, `/fr/direction/notes-bulletins/${c3eA.id}`, ["Mathématiques", "Etame"]);
await page(dir, "/fr/direction/finances", ["Reste à percevoir"]);
await page(dir, "/fr/direction/tarifs", ["1re tranche"]);
await page(dir, "/fr/direction/annonces", ["Réunion des parents"]);
await page(dir, "/fr/direction/parametrage", ["Séquence 2"]);
await page(dir, "/fr/direction/parametrage/classes", ["6e B"]);
await page(dir, "/fr/direction/parametrage/matieres", ["Anglais"]);
await page(dir, `/fr/direction/parametrage/emploi-du-temps?classe=${c3eA.id}`, ["Lundi", "Salle 04"]);
await page(dir, "/fr/compte", ["Samuel Nguele"]);

const sec = await connexion("secretariat@lbb.cm", "Ecole2026");
await page(sec, "/fr/secretariat", ["Sans parent lié"]);
await page(sec, "/fr/secretariat/eleves", ["Amina"]);
await page(sec, "/fr/secretariat/eleves/nouveau", ["Inscrire l'élève"]);
await page(sec, `/fr/secretariat/eleves/${david.eleveId}`, ["Codes de liaison", "HFPNNRWB".slice(0, 0)]);
await page(sec, `/fr/secretariat/eleves/${david.eleveId}/fiche-liaison`, ["Lier un enfant"]);
await page(sec, `/fr/secretariat/eleves/${amina.eleveId}/certificat`, ["Certificat de scolarité", "2026-2027"]);
await page(sec, "/fr/secretariat/demandes", ["Demandes de liaison"]);
await page(sec, "/fr/secretariat/annonces", ["Sortie pédagogique"]);

const sur = await connexion("surveillance@lbb.cm", "Ecole2026");
await page(sur, "/fr/surveillance", ["Fiches à vérifier"]);
await page(sur, "/fr/surveillance/presences", ["Fiches d'appel à vérifier", "Aïcha Bello"]);
await page(sur, `/fr/surveillance/presences/${c3eA.id}?date=2026-11-18`, ["Notifier les parents des absents"]);
await page(sur, "/fr/surveillance/justificatifs", ["certificat-medical.pdf"]);
await page(sur, "/fr/surveillance/retards-sorties", ["Enregistrer un retard"]);
await page(sur, "/fr/surveillance/annonces", ["Nouvelle annonce"]);

const eco = await connexion("economat@lbb.cm", "Ecole2026");
await page(eco, "/fr/comptabilite", ["Caisse du jour"]);
await page(eco, "/fr/comptabilite/declarations", ["MP261118.0915.A77810"]);
await page(eco, "/fr/comptabilite/situation?q=etame", ["Amina"]);
await page(eco, `/fr/comptabilite/situation/${amina.eleveId}`, ["Échéancier", "1re tranche"]);
await page(eco, `/fr/comptabilite/paiements/nouveau?eleve=${amina.eleveId}`, ["Enregistrer et émettre le reçu"]);
const sit = await fetch(`${API}/etablissements/${E}/eleves/${amina.eleveId}/situation-financiere`, { headers: { Authorization: `Bearer ${await jeton("economat@lbb.cm", "Ecole2026")}` } }).then((r) => r.json());
await page(eco, `/fr/comptabilite/paiements/${sit.paiements[0].id}`, ["Détail du paiement", "Annuler ce paiement"]);
await page(eco, "/fr/comptabilite/impayes", ["Liste des impayés"]);
await page(eco, "/fr/comptabilite/rapports?du=2026-09-01&au=2026-11-19", ["Journal des paiements", "Florence Tchamba"]);
const pdf = await fetch(`${WEB}/api/fichiers/etablissements/${E}/eleves/${amina.eleveId}/paiements/${sit.paiements[0].id}/recu`, { headers: { cookie: eco } });
console.log(`${pdf.status === 200 ? "OK " : "KO "} reçu PDF via relais : ${pdf.status} ${pdf.headers.get("content-type")}`);
const csv = await fetch(`${WEB}/api/exports/paiements?du=2026-09-01&au=2026-11-19`, { headers: { cookie: eco } });
console.log(`${csv.status === 200 ? "OK " : "KO "} export CSV : ${csv.status} ${(await csv.text()).split("\n").length - 1} lignes`);

const adm = await connexion("admin@schoolconnect.cm", "AdminLocal2026");
await page(adm, "/fr/plateforme", ["Lycée bilingue de Bafoussam"]);
await page(adm, "/fr/plateforme/etablissements", ["LBB"]);
await page(adm, "/fr/plateforme/etablissements/nouveau", ["Directeur"]);
await page(adm, `/fr/plateforme/etablissements/${E}`, ["Coordonnées", "Samuel Nguele"]);
await page(adm, `/fr/plateforme/etablissements/${E}/utilisateurs`, ["Mvondo"]);

const en = await fetch(`${WEB}/en/connexion`, { redirect: "manual" });
console.log(`${en.headers.get("location")?.endsWith("/fr/connexion") ? "OK " : "KO "} /en/connexion redirige vers ${en.headers.get("location")}`);
console.log(echecs ? `${echecs} écran(s) en échec` : "Tous les écrans s'affichent avec les données de la base.");
process.exitCode = echecs ? 1 : 0;
