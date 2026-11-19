<p align="center">
  <img src="public/logo-schoolconnect.png" alt="Logo SchoolConnect" width="220" />
</p>

# SchoolConnect — application web

**SchoolConnect** est un projet mis à la disposition des établissements secondaires camerounais
pour centraliser et sécuriser leur gestion administrative, pédagogique et financière, et rapprocher
l'école des familles.

Ce dépôt contient l'**application web** des espaces **Direction**, **Secrétariat**, **Surveillant général**,
**Comptabilité** et **Super-admin**. Les parents et les enseignants utilisent l'application mobile.

Toutes les données affichées viennent du **backend Spring Boot SchoolConnect** (base PostgreSQL) :
il n'y a plus de données d'exemple dans l'application.

## Fonctionnalités

| Espace | Fonctionnalités |
|---|---|
| **Super-admin** | vue d'ensemble, création d'un établissement avec son année scolaire et son directeur, personnel d'un établissement |
| **Direction** | tableau de bord (effectifs, présence sur 7 jours, encaissements), élèves et dossiers, classes (élèves, équipe pédagogique, emploi du temps), personnel et affectations des enseignants, résultats par classe (moyennes, rang), finances, frais de scolarité, annonces, paramétrage (année, périodes et ouverture de la saisie des notes, classes, matières, emploi du temps) |
| **Secrétariat** | inscription d'un élève et de son tuteur (lien direct ou code de liaison), dossier élève (changement de classe, tuteurs, codes), fiche de liaison et certificat de scolarité imprimables, demandes de liaison des parents, annonces |
| **Surveillance générale** | présences du jour, **fiches d'appel soumises par les enseignants à vérifier puis notification des parents des absents**, appel de rattrapage, justificatifs d'absence (pièce jointe, décision), retards et sorties anticipées, annonces |
| **Comptabilité** | caisse du jour, encaissement avec reçu PDF, annulation motivée, déclarations de paiement des parents (preuve, validation, rejet), situation d'un élève, impayés et relances, journal et rapport de caisse, export Excel |
| **Tous** | connexion par adresse e-mail (comptes créés par la direction ou le super-admin, pas d'inscription), « Mon compte », mot de passe oublié par code ; application uniquement en français |

Écrans sans équivalent dans le backend (affichent « pas encore disponible ») : abonnements, support, journal
d'audit, assiduité du personnel, notifications du personnel, calendrier, paramètres d'évaluation, import
d'élèves, réinscriptions, invitation par lien.

## Démarrer

Prérequis : Node.js 20 ou plus récent, et le backend SchoolConnect lancé (voir son
`docs/INTEGRATION-MOBILE-WEB.md`).

```bash
cp .env.example .env.local   # API_URL et SESSION_SECRET
npm install
npm run dev
```

Ouvrir http://localhost:3000 : l'application redirige vers `/fr/connexion`. Elle est uniquement en français.

| Variable | Rôle |
|---|---|
| `API_URL` | API du backend, préfixe compris : `http://localhost:8080/api/v1` en local |
| `SESSION_SECRET` | clé du cookie de session (32 caractères minimum) |

### Comptes de test (backend local)

Créés par `scripts/donnees-test-local.ps1` du dépôt backend. Le personnel se connecte avec son **adresse e-mail** (pas d'inscription sur le web).

| Rôle | Identifiant | Mot de passe |
|---|---|---|
| Directeur | direction@lbb.cm | Ecole2026 |
| Secrétaire | secretariat@lbb.cm | Ecole2026 |
| Surveillant général | surveillance@lbb.cm | Ecole2026 |
| Économe | economat@lbb.cm | Ecole2026 |
| Super-admin | admin@schoolconnect.cm | AdminLocal2026 |

## Architecture

| Élément | Rôle |
|---|---|
| `src/lib/api/backend.ts` | toutes les lectures et écritures vers le backend, et la conversion des réponses pour les écrans |
| `src/lib/api/client.ts` | client HTTP côté serveur (jeton de session, messages d'erreur du backend) |
| `src/features/*/actions.ts` | Server Actions (formulaires) |
| `src/app/api/fichiers/…` | relais des fichiers protégés (pièces justificatives, preuves, reçus PDF) : le jeton reste côté serveur |
| `src/app/api/exports/[type]` | exports CSV (élèves, impayés, paiements) |

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | serveur de développement (http://localhost:3000) |
| `npm run build` | build de production (vérifie aussi les types) |
| `npm start` | serveur de production |
| `npm run lint` | ESLint |

## Identité visuelle

Le logo officiel est dans `public/logo-schoolconnect.png` et les icônes du navigateur dans `src/app/`
(`favicon.ico`, `icon.png`, `apple-icon.png`). Il apparaît dans le menu latéral, sur l'écran de connexion et en
en-tête des documents imprimables (certificats, fiches de liaison).
