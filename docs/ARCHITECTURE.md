# SchoolConnect — Architecture de l'application web

Sources : cahier des charges, cas d'utilisation (CU-*), maquettes web, dictionnaire de données,
livrable du Groupe 5 (dossier `Projet Smart realization`).

## 1. Place de l'application web dans le système

```
 ┌───────────────────────┐      ┌────────────────────────┐
 │  App web (ce dépôt)   │      │  App mobile (Flutter)  │
 │  Next.js 16           │      │  Enseignants, parents, │
 │  Super-admin,         │      │  élèves                │
 │  direction,           │      └───────────┬────────────┘
 │  secrétariat,         │                  │
 │  surveillance,        │                  │
 │  comptabilité         │                  │
 └──────────┬────────────┘                  │
            │ HTTPS (serveur → serveur)     │ HTTPS
            ▼                               ▼
 ┌─────────────────────────────────────────────────────┐
 │  API Spring Boot (développée séparément)           │
 │  RBAC, multi-tenant, calculs (moyennes, rangs,      │
 │  soldes), PDF, SMS/email/push, Mobile Money, audit  │
 └─────────────────────────────────────────────────────┘
```

- **Le web ne contient pas de logique métier** : pas de base de données, pas de calcul de notes ni de soldes.
  Il **lit** l'API (Server Components) et **écrit** via l'API (Server Actions).
- C'est un **BFF** (backend for frontend) : le jeton d'accès reste dans un cookie httpOnly chiffré,
  côté serveur Next. Le navigateur n'appelle jamais l'API Spring Boot directement.
- Tant que l'API n'est pas prête, le **mode données d'exemple** (par défaut ; `USE_MOCK_API=false` pour le couper)
  sert les données des maquettes depuis une base en mémoire (`src/lib/api/mock`). Elle se réinitialise au redémarrage.

## 2. Pile technique

| Sujet | Choix |
|---|---|
| Framework | Next.js 16 (App Router, `cacheComponents`, React Compiler), React 19, TypeScript strict |
| Style | Tailwind CSS v4 (jetons de couleur dans `globals.css`) |
| i18n | Segment `/[lang]` (fr, en) + `next/root-params` ; textes écrits dans les deux langues au plus près de l'écran : `t("Élèves", "Students")` |
| Session | Cookie httpOnly signé (JWT HS256, `jose`) |
| Validation | Zod 4 (formulaires, Server Actions) |
| Graphiques | SVG maison, sans bibliothèque (léger en 3G) |
| Icônes | lucide-react |

## 3. Espaces et routes

Une route = un écran de maquette. Toutes les URL sont préfixées par la langue : `/fr/...` ou `/en/...`.
Le `proxy.ts` ajoute la langue manquante (`/direction` → `/fr/direction`).

| Espace | Rôle | Routes principales |
|---|---|---|
| `(auth)` | public | `connexion`, `mot-de-passe-oublie`, `invitation/[token]` |
| `plateforme` | super_admin | vue d'ensemble, `etablissements` (+ `nouveau` en 4 étapes, `[id]` avec onglets), `abonnements`, `support/[ticketId]`, `utilisateurs`, `notifications` |
| `direction` | direction | tableau de bord, `eleves`, `personnel` (+ `nouveau`, `[id]`), `notes-bulletins`, `assiduite-personnel`, `finances`, `classes`, `tarifs`, `utilisateurs`, `annonces`, `support`, `parametrage/*` (6 onglets), `notifications` |
| `secretariat` | secretariat | accueil, `eleves` (+ `nouveau`, `import`, `reinscriptions`, `[inscriptionId]` avec `certificat` et `fiche-liaison` imprimables), `demandes`, `annonces` (lecture), `notifications` |
| `surveillance` | surveillant | tableau de bord, `presences` (+ `[classeId]` pour l'appel), `justificatifs`, `retards-sorties`, `assiduite-personnel`, `annonces`, `notifications` |
| `comptabilite` | comptable | tableau de bord, `paiements/nouveau`, `paiements/[id]`, `declarations`, `situation` (+ `[inscriptionId]`), `impayes`, `rapports`, `notifications` |
| `compte` | tous | profil, mot de passe, langue, préférences de notification |

Chaque `page.tsx` porte en en-tête l'écran de maquette et les CU couverts.

Règles de rôle tirées des maquettes :
- La direction **consulte** les élèves ; le **secrétariat** inscrit et corrige.
  Les corrections d'identité passent par la **validation du directeur**.
- Seuls la direction et le surveillant général **publient** des annonces ; le secrétariat les lit.
- Une annulation de paiement exige un motif et la **validation de la direction**.
- Un bulletin n'est visible par les parents qu'après **validation et publication** par la direction.

## 4. Organisation du code

```
src/
├─ app/                      ← ROUTAGE UNIQUEMENT (pages minces)
│  ├─ [lang]/
│  │  ├─ layout.tsx          ← layout racine (<html lang>)
│  │  ├─ (auth)/…            ← écrans publics
│  │  ├─ plateforme/ direction/ secretariat/ surveillance/ comptabilite/
│  │  │   └─ layout.tsx      ← requireRole(...) + <AppShell espace=…>
│  │  └─ compte/
│  └─ api/
│     ├─ exports/[type]/route.ts     ← exports Excel (CSV UTF-8, « ; »)
│     └─ fichiers/[...chemin]/route.ts ← relais des fichiers protégés (PDF) via le BFF
├─ proxy.ts                  ← langue + contrôle optimiste de session
├─ features/<module>/        ← LOGIQUE PAR DOMAINE
│  ├─ queries.ts             ← lectures (Server Components)
│  ├─ actions.ts             ← Server Actions (écritures)
│  ├─ schemas.ts             ← schémas Zod des formulaires
│  └─ components/            ← composants propres au module
├─ components/
│  ├─ ui/                    ← design system (Button, Badge, DataTable, Stepper, StatCard…)
│  ├─ layout/                ← AppShell, Sidebar, Topbar, PageHeader, LocaleSwitcher
│  └─ charts/                ← histogramme, courbe, anneau
├─ lib/
│  ├─ api/                   ← client HTTP Spring Boot (lire/ecrire), erreurs, pagination
│  │  └─ mock/               ← base d'exemple en mémoire qui imite l'API (un fichier par domaine)
│  ├─ auth/                  ← session, DAL (getCurrentUser, requireRole), rôles, permissions
│  ├─ i18n/                  ← config, getT() serveur, useT() client
│  ├─ actions.ts             ← EtatFormulaire, lecture des FormData, erreurs Zod
│  ├─ labels.ts              ← libellés bilingues des statuts + ton des badges
│  ├─ format.ts              ← FCFA, dates, heures
│  └─ utils.ts
├─ config/navigation.ts      ← menus latéraux par espace
└─ types/                    ← enums + types de domaine (dictionnaire de données)
```

### Modules (`src/features`)

| Module | Contenu | CU |
|---|---|---|
| `auth` | connexion, invitation, mot de passe, choix d'établissement | — |
| `plateforme` | établissements, abonnements, comptes directeurs, doublons | SAD-01..06 |
| `support` | tickets (création côté école, traitement côté plateforme) | SAD-05 |
| `tableaux-de-bord` | indicateurs agrégés par espace | DIR-01 |
| `parametrage` | année, périodes, classes, matières, coefficients, calendrier | DIR-02 |
| `eleves` | inscription, réinscription, dossier, corrections, import, documents | SEC-01..08, 10 |
| `liaisons` | tuteurs, codes de liaison, demandes parent-enfant | SEC-04, 05 |
| `personnel` | fiches, affectations, congés, comptes | DIR-03, SEC-09 |
| `presences` | présences élèves, appel de rattrapage, retards, sorties | SUR-01, 02, 04 |
| `justificatifs` | validation des justificatifs d'absence | SUR-03 |
| `assiduite-personnel` | présence du personnel, heures prévues/effectuées | SUR-05, DIR-06 |
| `notes-bulletins` | avancement de la saisie, validation, publication | DIR-05 |
| `finances` | tarifs, échéanciers, remises, paiements, reçus, déclarations, impayés, caisse | DIR-04, 07, ECO-01..09 |
| `annonces` | publication et historique | DIR-08, SUR-07 |
| `notifications` | centre de notifications + préférences | SYS-01 |
| `audit` | utilisateurs de l'établissement, journal d'audit | DIR-03, 10, SYS-04 |
| (route `api/exports`) | exports Excel | DIR-09, ECO-09 |

## 5. Flux de données type

```
layout d'espace → <AppShell roles> → <Suspense> → requireRole() (lecture du cookie)
page.tsx (Server Component) → features/x/queries.ts → lire(mock, "/chemin/api")
                                                       ├─ mode exemple : connection() + lib/api/mock
                                                       └─ sinon : GET API Spring Boot (jeton de session)
formulaire (Client Component, useActionState)
  └─ features/x/actions.ts ('use server') → exigerRole() → Zod → ecrire(mock, "/chemin", "POST", data) → refresh()
bouton d'action simple → <ActionButton action={action.bind(null, id)}> (fonctionne sans JavaScript)
```

Chaque fonction de `queries.ts` / `actions.ts` indique le chemin d'API attendu : c'est le **contrat pour l'équipe
backend**. Brancher l'API réelle = `USE_MOCK_API=false` + `API_URL`, sans toucher aux pages.

## 6. Sécurité et multi-tenant

- **Défense en profondeur** : le `proxy.ts` fait un contrôle optimiste, le `layout.tsx` de chaque espace
  appelle `requireRole()`, et l'**API reste l'autorité** (RBAC + isolation par `etablissement_id`).
- La session contient l'établissement courant ; chaque appel API envoie `X-Etablissement-Id`.
- Les données sensibles (santé, finances) ne sont jamais sérialisées vers le client sans nécessité.
- Le support plateforme accède en **lecture seule** et chaque accès est journalisé (maquette « Accès support »).

## 7. Conventions

- Segments d'URL et vocabulaire métier **en français** (`eleves`, `inscriptionId`), comme le dictionnaire de données.
- Fichiers en kebab-case, composants en PascalCase, champs en camelCase.
- Aucun texte d'interface dans une seule langue : chaque libellé passe par `t("…fr…", "…en…")`.
- Écrans peu gourmands (3G, Android d'entrée de gamme) : Server Components par défaut,
  `"use client"` seulement pour l'interactivité.

## 8. Comptes de démonstration (mode données d'exemple)

Mot de passe commun : `demo1234` (boutons de remplissage sur l'écran de connexion).

| Rôle | Identifiant |
|---|---|
| Super-administrateur | admin@schoolconnect.cm |
| Directeur | p.nkeng@lycee-bafoussam.cm |
| Secrétaire | j.tchoua@lycee-bafoussam.cm |
| Surveillant général | e.owona@lycee-bafoussam.cm |
| Comptable | m.biloa@lycee-bafoussam.cm |
