# SchoolConnect — Architecture de l'application web

<img src="../public/logo-schoolconnect.png" alt="Logo SchoolConnect" width="160" />

Sources : cahier des charges, cas d'utilisation (CU-*), maquettes web, dictionnaire de données et livrable du
Groupe 5 (dossier `Projet Smart realization`).

Documents liés :
- [DONNEES-DE-TEST.md](DONNEES-DE-TEST.md) : comptes, jeu de données, fichiers de test et scénarios de recette.
- [CONTRAT-API.md](CONTRAT-API.md) : endpoints attendus par le frontend, à aligner avec le backend Spring Boot.

---

## 1. Place de l'application web dans le système

```
 ┌───────────────────────┐      ┌────────────────────────┐
 │  App web (ce dépôt)   │      │  App mobile            │
 │  Next.js 16           │      │  (terminée)            │
 │  Super-admin,         │      │  Enseignants, parents, │
 │  direction,           │      │  élèves                │
 │  secrétariat,         │      └───────────┬────────────┘
 │  surveillance,        │                  │
 │  comptabilité         │                  │
 └──────────┬────────────┘                  │
            │ HTTPS (serveur → serveur)     │ HTTPS
            ▼                               ▼
 ┌─────────────────────────────────────────────────────┐
 │  API Spring Boot (développée séparément)            │
 │  RBAC, multi-tenant, calculs (moyennes, rangs,      │
 │  soldes), PDF, SMS/email/push, Mobile Money, audit  │
 └─────────────────────────────────────────────────────┘
```

État du projet :

| Brique | État |
|---|---|
| Application mobile | Terminée |
| Backend Spring Boot | Développé par une autre personne, à intégrer |
| **Application web (ce dépôt)** | **Frontend terminé, fonctionne en mode données d'exemple** |

Principes :
- **Le web ne contient pas de logique métier** : il n'a pas de base de données et ne calcule ni les notes ni les
  soldes. Il **lit** l'API (Server Components) et **écrit** via l'API (Server Actions).
- C'est un **BFF** (backend for frontend). Le jeton d'accès reste dans un cookie httpOnly signé, côté serveur Next.
  Le navigateur n'appelle jamais l'API Spring Boot directement.
- En attendant l'intégration, le **mode données d'exemple** (activé par défaut) sert les données des maquettes
  depuis une base en mémoire qui imite l'API (`src/lib/api/mock`). Elle se réinitialise au redémarrage du serveur.

## 2. Pile technique

| Sujet | Choix |
|---|---|
| Framework | Next.js 16 (App Router, `cacheComponents`, React Compiler), React 19, TypeScript strict |
| Style | Tailwind CSS v4, jetons de couleur dans `src/app/globals.css` |
| i18n | Segment d'URL `/[lang]` (fr, en) + `next/root-params`. Chaque texte est écrit dans les deux langues, au plus près de l'écran : `t("Élèves", "Students")` |
| Session | Cookie httpOnly signé (JWT HS256, bibliothèque `jose`) |
| Validation | Zod 4 (formulaires et Server Actions), dates strictes (`dateValide` refuse le 31/02) |
| Graphiques | SVG maison, sans bibliothèque (léger en 3G) |
| Icônes | lucide-react |

## 3. Identité visuelle

| Élément | Valeur |
|---|---|
| Logo | `public/logo-schoolconnect.png` (640 px, fond transparent, tiré de `Logo SchoolConnect.png`), affiché par le composant `src/components/ui/logo.tsx` via `next/image` (environ 14 Ko servis) |
| Icônes du navigateur | `src/app/favicon.ico`, `src/app/icon.png` (512 px), `src/app/apple-icon.png` (180 px), détectés automatiquement par Next |
| Où le logo apparaît | menu latéral, écran de connexion (panneau bleu et version mobile), en-tête des documents imprimables (reçu, certificat, fiche de liaison) |
| Couleurs | bleu marine `navy-700` `#173f73`, vert `brand-600` `#0e7c5a`, fond `surface` `#f2f5f9` |
| Police | Inter (`next/font`) |

Pour changer de logo, remplacez `public/logo-schoolconnect.png` et les trois icônes de `src/app/` en gardant les
mêmes noms.

## 4. Espaces et routes

Une route correspond à un écran de maquette. Toutes les URL commencent par la langue : `/fr/...` ou `/en/...`.
Le `proxy.ts` ajoute la langue si elle manque (`/direction` → `/fr/direction`).

| Espace | Rôle | Routes |
|---|---|---|
| `(auth)` | public | `connexion`, `mot-de-passe-oublie`, `invitation/[token]` |
| `plateforme` | super_admin | vue d'ensemble, `etablissements` (+ `nouveau` en 4 étapes, `[id]` avec onglets `abonnement`, `utilisateurs`, `activite`), `abonnements`, `support` (+ `[ticketId]`), `utilisateurs`, `notifications` |
| `direction` | direction | tableau de bord, `eleves` (+ `[id]`), `personnel` (+ `nouveau`, `[id]`), `notes-bulletins` (+ `[classeId]`), `assiduite-personnel`, `finances`, `classes` (+ `[classeId]`), `tarifs`, `utilisateurs`, `annonces`, `support`, `parametrage` (+ `classes`, `matieres`, `calendrier`, `evaluation`, `frais`), `notifications` |
| `secretariat` | secretariat | accueil, `eleves` (+ `nouveau`, `import`, `reinscriptions`, `[id]`, `[id]/certificat`, `[id]/fiche-liaison`), `demandes`, `annonces` (lecture seule), `notifications` |
| `surveillance` | surveillant | tableau de bord, `presences` (+ `[classeId]` pour l'appel), `justificatifs`, `retards-sorties`, `assiduite-personnel`, `annonces`, `notifications` |
| `comptabilite` | comptable | tableau de bord, `paiements/nouveau`, `paiements/[id]` (reçu), `declarations`, `situation` (+ `[id]`), `impayes`, `rapports`, `notifications` |
| `compte` | tous | profil, langue, mot de passe |

Routes techniques (`src/app/api`) :

| Route | Rôle | Usage |
|---|---|---|
| `GET /api/exports/[type]` | selon l'export | exports Excel (CSV UTF-8 avec BOM, séparateur `;`) : `eleves`, `personnel`, `assiduite-personnel`, `bulletins`, `impayes`, `paiements-du-jour`, `paiements`, `rapport-financier` |
| `GET /api/fichiers/[...chemin]` | connecté | relais des fichiers protégés de l'API (PDF, pièces jointes) |
| `GET /api/donnees-test` | super_admin | export JSON complet du jeu de données d'exemple (désactivé quand l'API réelle est branchée) |

Chaque `page.tsx` indique en en-tête l'écran de maquette et les CU qu'il couvre.

Règles de gestion appliquées (tirées des maquettes et du cahier des charges) :
- La direction **consulte** les élèves ; le **secrétariat** inscrit et corrige.
- Les corrections d'identité (nom, prénom, naissance, sexe) passent par la **validation du directeur**. Les autres
  corrections (tuteur, téléphone) s'appliquent tout de suite et restent dans l'historique.
- Une inscription est refusée si un élève de mêmes nom, prénom et date de naissance existe (**doublon**).
- Seuls la direction et le surveillant général **publient** des annonces ; le secrétariat les lit.
- Une annulation de paiement exige un **motif** et la **validation de la direction**.
- Un paiement ne peut pas dépasser le **solde** ; la **référence de transaction** est obligatoire hors espèces.
- Un bulletin n'est visible par les parents qu'après **validation et publication** par la direction.
- Un établissement suspendu ou expiré bloque la connexion de ses utilisateurs.

## 5. Organisation du code

```
src/
├─ app/                      ← ROUTAGE UNIQUEMENT (pages minces)
│  ├─ favicon.ico, icon.png, apple-icon.png   ← icônes tirées du logo
│  ├─ globals.css            ← jetons de couleur, styles d'impression
│  ├─ [lang]/
│  │  ├─ layout.tsx          ← layout racine (<html lang>, police, I18nProvider)
│  │  ├─ (auth)/…            ← écrans publics
│  │  ├─ plateforme/ direction/ secretariat/ surveillance/ comptabilite/
│  │  │   └─ layout.tsx      ← <AppShell roles=[…]> : contrôle du rôle + menu latéral
│  │  └─ compte/
│  └─ api/                   ← exports, fichiers, donnees-test
├─ proxy.ts                  ← langue + contrôle optimiste de session
├─ features/<module>/        ← LOGIQUE PAR DOMAINE
│  ├─ queries.ts             ← lectures (Server Components) ; chaque fonction indique son endpoint
│  ├─ actions.ts             ← Server Actions (écritures)
│  ├─ schemas.ts             ← schémas Zod des formulaires
│  └─ components/            ← composants propres au module
├─ components/
│  ├─ ui/                    ← design system : Logo, Button, Badge, Card, DataTable, Tabs, Stepper, Dialog,
│  │                            StatCard, ActionButton, ActionForm, SubmitButton, FormMessage…
│  ├─ layout/                ← AppShell, Sidebar, PageHeader, LocaleSwitcher
│  ├─ charts/                ← histogramme, courbe, anneau (SVG)
│  └─ documents/             ← gabarit A4 imprimable + bouton Imprimer
├─ lib/
│  ├─ api/                   ← client HTTP (lire/ecrire), erreurs, pagination
│  │  └─ mock/               ← base d'exemple en mémoire (un fichier par domaine)
│  ├─ auth/                  ← session, DAL (getCurrentUser, requireRole, exigerRole), rôles, permissions
│  ├─ i18n/                  ← config, getT() serveur, useT() client
│  ├─ actions.ts             ← EtatFormulaire, lecture des FormData, erreurs Zod
│  ├─ labels.ts              ← libellés bilingues des statuts + couleur des badges
│  ├─ format.ts              ← FCFA, dates, heures (heure locale)
│  └─ utils.ts               ← cn, initiales, dateValide…
├─ config/navigation.ts      ← menus latéraux par espace (+ compteurs)
└─ types/domain.ts           ← types de domaine (calqués sur le dictionnaire de données)
scripts/test-fumee.mjs       ← test de fumée de toutes les pages
docs/donnees-test/           ← fichiers CSV d'import + jeu de données JSON
```

### Modules (`src/features`)

| Module | Contenu | CU |
|---|---|---|
| `auth` | connexion, déconnexion, mot de passe oublié, invitation, profil | — |
| `plateforme` | établissements, abonnements, comptes, support (côté plateforme) | SAD-01..06 |
| `support` | demandes d'assistance (côté établissement) | SAD-05 |
| `tableaux-de-bord` | indicateurs par espace + compteurs du menu | DIR-01 |
| `parametrage` | année, trimestres, séquences, classes, matières, calendrier, évaluation | DIR-02 |
| `eleves` | inscription, réinscription, dossier, corrections, import, archivage, documents | SEC-01..08, 10 |
| `liaisons` | demandes de liaison parent-enfant | SEC-04, 05 |
| `personnel` | fiches, affectations, congés, comptes | DIR-03, SEC-09 |
| `presences` | présences élèves, appel de rattrapage, retards et sorties | SUR-01, 02, 04 |
| `justificatifs` | validation des justificatifs d'absence | SUR-03 |
| `assiduite-personnel` | appel du personnel, heures prévues et effectuées | SUR-05, 08, DIR-06 |
| `notes-bulletins` | avancement de la saisie, validation, publication, aperçu | DIR-05 |
| `finances` | tarifs, échéanciers, remises, paiements, reçus, déclarations, impayés, relances, caisse | DIR-04, 07, ECO-01..09 |
| `annonces` | publication, programmation, brouillons | DIR-08, SUR-07 |
| `notifications` | centre de notifications et préférences | SYS-01 |
| `audit` | comptes de l'établissement, journal d'audit, corrections à valider | DIR-03, 10, SYS-04 |

## 6. Flux de données

```
layout d'espace → <AppShell roles> → <Suspense> → requireRole() (lecture du cookie)
page.tsx (Server Component) → features/x/queries.ts → lire(mock, "/chemin/api")
                                                       ├─ mode exemple : connection() + lib/api/mock
                                                       └─ sinon : GET API Spring Boot (jeton de session)
formulaire (Client Component, useActionState)
  └─ features/x/actions.ts ('use server') → exigerRole() → Zod → ecrire(mock, "/chemin", "POST", data) → refresh()
bouton d'action simple → <ActionButton action={action.bind(null, id)}> (fonctionne même sans JavaScript)
```

## 7. Intégration avec le backend Spring Boot

Le passage aux vraies données se fait sans toucher aux pages :

1. **Configuration** : dans `.env.local`, définir `USE_MOCK_API=false`, `API_URL` (par défaut
   `http://localhost:8080/api`) et un `SESSION_SECRET` aléatoire.
2. **Endpoints** : comparer [CONTRAT-API.md](CONTRAT-API.md) avec les contrôleurs Spring Boot et corriger les chemins
   dans `src/features/*/queries.ts` et `actions.ts` (un seul endroit par appel).
3. **Client HTTP** (`src/lib/api/client.ts`) : adapter aux conventions du backend.
   - Authentification : format de réponse de la connexion et des jetons (dans `features/auth/actions.ts`), puis le
     rafraîchissement du jeton.
   - Pagination : si l'API renvoie un `Page` Spring (`content`, `totalElements`, `number`, `size`), le convertir en
     `Page<T>` (`items`, `total`, `page`, `taille`). Attention : Spring numérote les pages à partir de 0.
   - Erreurs : lire le JSON d'erreur Spring (`status`, `error`, `message`) dans `messageErreur()`.
   - Multi-tenant : l'en-tête `X-Etablissement-Id` est envoyé à chaque appel ; à renommer si besoin.
4. **Types** : vérifier que les DTO du backend correspondent à `src/types/domain.ts` (noms en camelCase).
5. **Données de test** : le backend peut charger `docs/donnees-test/jeu-de-donnees.json` pour avoir exactement les
   mêmes données que le frontend, ce qui facilite la comparaison écran par écran.
6. **Vérifier** : relancer `npm run test:fumee` et dérouler les scénarios de [DONNEES-DE-TEST.md](DONNEES-DE-TEST.md).

## 8. Sécurité et multi-tenant

- **Défense en profondeur** : le `proxy.ts` fait un contrôle rapide du cookie, le layout de chaque espace appelle
  `requireRole()`, chaque Server Action appelle `exigerRole()`, et l'**API reste l'autorité** (RBAC et isolation des
  données par établissement).
- La session contient l'établissement courant ; chaque appel API envoie `X-Etablissement-Id`.
- Le mot de passe d'un membre n'est jamais visible par la direction (invitation par lien).
- Le support plateforme accède en **lecture seule**, et chaque accès est journalisé.
- Les exports et l'export JSON des données de test vérifient le rôle (réponse 403 sinon).

## 9. Tests et qualité

| Commande | Vérifie |
|---|---|
| `npm run build` | compilation et types |
| `npm run lint` | ESLint (règles React Compiler incluses) |
| `npm run test:fumee` | toutes les pages des 5 rôles, les exports, les redirections et les refus d'accès (serveur démarré) |

Les scénarios manuels de recette sont dans [DONNEES-DE-TEST.md](DONNEES-DE-TEST.md).

## 10. Conventions

- Segments d'URL et vocabulaire métier **en français** (`eleves`, `inscriptionId`), comme le dictionnaire de données.
- Fichiers en kebab-case, composants en PascalCase, champs en camelCase.
- Aucun texte d'interface dans une seule langue : chaque libellé passe par `t("…fr…", "…en…")`.
- Écrans légers (3G, Android d'entrée de gamme) : Server Components par défaut, `"use client"` seulement pour
  l'interactivité ; graphiques en SVG ; recherches et filtres par formulaires GET.
- Next.js 16 diffère des versions précédentes : lire `node_modules/next/dist/docs/` avant de modifier le code
  (voir `AGENTS.md`).

## 11. Limites connues

- Les bulletins se consultent à l'écran (aperçu) ; la génération PDF sera faite par l'API.
- L'aperçu des pièces jointes des justificatifs est un emplacement réservé jusqu'à l'intégration du stockage.
- « Préparer l'année suivante » est désactivé (prévu en fin d'année).
- Le choix d'établissement pour un utilisateur rattaché à plusieurs écoles n'est pas encore géré (les comptes de
  démonstration n'en ont qu'une).
- Les messages de retour des formulaires (succès, erreurs) nécessitent JavaScript ; les boutons d'action simples
  fonctionnent sans.
