# SchoolConnect — Contrat d'API attendu par le frontend web

<img src="../public/logo-schoolconnect.png" alt="Logo SchoolConnect" width="140" />

Ce document liste **tous les appels que l'application web fera au backend Spring Boot** une fois le mode données
d'exemple désactivé. Il sert de base de discussion avec le développeur du backend : là où les chemins ou les
formats diffèrent, on adapte le frontend (un seul endroit par appel, dans `src/features/*/queries.ts` ou
`actions.ts`) ou le backend.

Les réponses attendues ont la forme des types de [`src/types/domain.ts`](../src/types/domain.ts) (noms de champs en
camelCase). Le jeu de données [`donnees-test/jeu-de-donnees.json`](donnees-test/jeu-de-donnees.json) donne un exemple
réel de chaque objet.

## 1. Conventions générales

| Sujet | Ce qu'envoie ou attend le frontend | Où l'adapter |
|---|---|---|
| URL de base | `API_URL` (par défaut `http://localhost:8080/api`) | `.env.local` |
| Authentification | `Authorization: Bearer <accessToken>` sur chaque appel | `src/lib/api/client.ts` |
| Établissement courant | `X-Etablissement-Id: <id>` (absent pour le super-admin) | `src/lib/api/client.ts` |
| Langue | `Accept-Language: fr` ou `en` | `src/lib/api/client.ts` |
| Corps | JSON (`Content-Type: application/json`) | — |
| Pagination | paramètre `page` à partir de **1** ; réponse `{ items, total, page, taille }` (8 éléments par page) | à convertir si l'API renvoie un `Page` Spring (`content`, `totalElements`, `number` à partir de 0, `size`) |
| Erreurs | code HTTP ≥ 400 et JSON avec un champ `message` (texte affiché tel quel à l'utilisateur) | `messageErreur()` dans `src/lib/api/errors.ts` |
| Calculs | moyennes, rangs, soldes, retards et statistiques **calculés par l'API** | — |

Les appels sont faits **côté serveur** (Next.js) : pas besoin de CORS pour le web.

## 2. Authentification et compte

| Méthode | Chemin | Corps / paramètres | Réponse attendue | Écran |
|---|---|---|---|---|
| POST | `/auth/connexion` | `{ identifiant, motDePasse }` (identifiant = courriel ou téléphone) | `{ utilisateur, etablissement, accessToken, refreshToken }` | Connexion |
| POST | `/auth/mot-de-passe-oublie` | `{ identifiant }` | 204 (ne jamais révéler si le compte existe) | Mot de passe oublié |
| POST | `/auth/invitation` | `{ token, motDePasse }` | 204 | Activation d'invitation |
| GET | `/moi` | — | `Utilisateur` | Mon compte |
| PUT | `/moi` | `{ telephone, email, langue }` | 204 | Mon compte |
| PUT | `/moi/mot-de-passe` | `{ actuel, nouveau }` | 204 (400 si `actuel` est faux) | Mon compte |
| GET | `/moi/compteurs` | — | `{ notifications?, bulletins?, demandes?, justificatifs?, declarations?, impayes?, tickets? }` | Badges du menu latéral |

Seuls les rôles `super_admin`, `direction`, `secretariat`, `surveillant` et `comptable` sont acceptés sur le web.

## 3. Tableaux de bord

| Méthode | Chemin | Réponse | Écran |
|---|---|---|---|
| GET | `/plateforme/statistiques` | totaux, établissements par mois, répartition des plans, renouvellements, derniers tickets | Vue d'ensemble (super-admin) |
| GET | `/tableaux-de-bord/direction` | effectifs, personnel, présence du jour et 7 jours, rapport financier, « À traiter », derniers paiements | Tableau de bord direction |
| GET | `/tableaux-de-bord/secretariat` | demandes, statistiques élèves, corrections en attente, dernières actions | Accueil secrétariat |
| GET | `/tableaux-de-bord/surveillance` | présence du jour, justificatifs en attente, retards répétés | Tableau de bord surveillance |
| GET | `/tableaux-de-bord/comptabilite` | caisse du jour, impayés, nombre de déclarations | Tableau de bord comptable |

## 4. Plateforme (super-admin)

| Méthode | Chemin | Paramètres / corps | Écran |
|---|---|---|---|
| GET | `/plateforme/etablissements` | `q`, `statut`, `page` | Établissements |
| GET | `/plateforme/etablissements/prochain-code` | — | Créer un établissement |
| POST | `/plateforme/etablissements` | établissement + directeur + abonnement (voir `DonneesEtablissement`) | Créer un établissement |
| GET | `/plateforme/etablissements/{id}` | — (inclut directeur, utilisateurs, activité, tickets) | Fiche établissement |
| PUT | `/plateforme/etablissements/{id}/statut` | `{ statut: "actif" \| "suspendu" }` | Fiche établissement |
| POST | `/plateforme/etablissements/{id}/abonnement` | `{ mois, plan? }` | Prolonger / convertir |
| POST | `/plateforme/etablissements/{id}/acces-support` | — (accès lecture seule, journalisé) | Support |
| GET | `/plateforme/abonnements` | `filtre` (`a_renouveler`, `essai`, `expire`, `suspendu`), `page` | Abonnements |
| GET | `/plateforme/tickets` | `statut` (`resolu` ou vide = ouverts) | Support |
| GET | `/plateforme/tickets/{id}` | — | Support |
| POST | `/plateforme/tickets/{id}/messages` | `{ texte }` | Support |
| POST | `/plateforme/tickets/{id}/resoudre` | — | Support |
| GET | `/plateforme/utilisateurs` | — | Utilisateurs et audit |
| POST | `/plateforme/utilisateurs/{id}/{action}` | `action` = `reinitialiser`, `renvoyer`, `deverrouiller` | Utilisateurs et audit |
| GET | `/plateforme/audit` | `page` | Utilisateurs et audit |

## 5. Scolarité : élèves, liaisons, corrections

| Méthode | Chemin | Paramètres / corps | Écran |
|---|---|---|---|
| GET | `/eleves` | `q`, `classeId`, `liaison`, `dossier` (`complet`/`incomplet`), `statut`, `page` | Listes d'élèves |
| GET | `/eleves/statistiques` | — | Liste des élèves |
| GET | `/eleves/annuaire` | — (liste légère `id, nom, matricule, classeId`) | Retards et sorties |
| GET | `/eleves/{id}` | — (inclut corrections et demandes de liaison) | Dossier de l'élève |
| POST | `/eleves` | `{ nom, prenom, sexe, dateNaissance, lieuNaissance, classeId, tuteurNom, tuteurTelephone, tuteurLien }` → `{ id, matricule, codeLiaison }` ; **409 si doublon** | Inscrire un élève |
| PUT | `/eleves/{id}/classe` | `{ classeId }` | Affecter / transférer |
| POST | `/eleves/{id}/corrections` | `{ champ, valeur }` → `{ identite }` (identité = en attente du directeur) | Dossier |
| POST | `/eleves/{id}/pieces` | `{ piece }` | Pièces manquantes |
| POST | `/eleves/{id}/code-liaison` | — | Régénérer le code |
| POST | `/eleves/{id}/sortie` | `{ motif }` | Archiver le dossier |
| POST | `/eleves/import` | `{ contenu }` (CSV brut) → `{ importes, doublons }` | Importer des élèves |
| GET | `/reinscriptions` | `q`, `classeId`, `page` | Réinscriptions |
| POST | `/reinscriptions` | `{ eleveId, classeId }` | Réinscriptions |
| GET | `/corrections` | `statut` (`a_traiter`, `attente_directeur`…) | Demandes, Utilisateurs et audit |
| POST | `/corrections/{id}/{decision}` | `decision` = `accepter` ou `refuser` (le directeur applique ; le secrétariat transmet les corrections d'identité) | Demandes |
| GET | `/liaisons/demandes` | — | Demandes |
| POST | `/liaisons/demandes/{id}/{decision}` | `decision` = `accepter` ou `refuser` | Demandes |

## 6. Paramétrage et classes

| Méthode | Chemin | Corps | Écran |
|---|---|---|---|
| GET | `/parametrage` | — (`annee, trimestres, sequences, calendrier, evaluation, matieres`) | Paramétrage |
| PUT | `/parametrage/annee` | `{ libelle, debut, fin, regime }` | Année et périodes |
| POST | `/parametrage/annee/cloturer` | — | Clôturer l'année |
| PUT | `/parametrage/trimestres/{id}` | `{ debut, fin, statut }` | Année et périodes |
| PUT | `/parametrage/sequences/{numero}` | `{ debut, fin, statut, saisieJusquau }` | Année et périodes |
| PUT | `/parametrage/evaluation` | `ParametresEvaluation` | Évaluation |
| GET | `/classes` | — (avec `effectif`, `titulaire`, `nbMatieres`) | Classes |
| GET | `/classes/{id}` | — (avec élèves et équipe pédagogique) | Détail d'une classe |
| POST | `/classes` | `{ libelle, niveau, cycle, capacite, titulaireId, sousSysteme }` | Nouvelle classe |
| PUT | `/classes/{id}` | `{ capacite, titulaireId }` | Modifier une classe |
| PUT | `/matieres` | `Matiere` (avec `id` = modification, sans = création ; 409 si code existant) | Matières et coefficients |
| POST | `/calendrier` | `{ libelle, debut, fin, type }` | Calendrier |
| DELETE | `/calendrier/{id}` | — | Calendrier |

## 7. Personnel et assiduité

| Méthode | Chemin | Paramètres / corps | Écran |
|---|---|---|---|
| GET | `/personnel` | `q`, `categorie`, `page` (+ compteurs par catégorie) | Personnel |
| GET | `/personnel/enseignants` | — | Listes de titulaires |
| GET | `/personnel/prochain-matricule` | — | Ajouter un membre |
| GET | `/personnel/{id}` | — | Fiche du membre |
| POST | `/personnel` | `DonneesMembre` → `{ id, matricule }` | Ajouter un membre |
| PUT | `/personnel/{id}/statut` | `{ statut, jusquau? }` | Congé / suspension |
| PUT | `/personnel/{id}/affectations` | `[{ classeId, matiere, heures }]` | Affectations |
| POST | `/personnel/{id}/invitation` | — | Renvoyer l'invitation |
| GET | `/personnel/assiduite` | — | Assiduité du personnel |
| GET | `/personnel/presences/jour` | — | Appel du personnel |
| PUT | `/personnel/presences/jour` | `{ [personnelId]: "P" \| "A" \| "R" }` | Appel du personnel |
| GET | `/utilisateurs` | `categorie` | Comptes de l'établissement |
| GET | `/audit` | `page` | Journal d'audit |

## 8. Vie scolaire

| Méthode | Chemin | Paramètres / corps | Écran |
|---|---|---|---|
| GET | `/presences/jour` | — (taux par classe, appels manquants, 7 derniers jours) | Présences |
| GET | `/presences/classes/{classeId}/appel` | — | Appel d'une classe |
| PUT | `/presences/classes/{classeId}/appel` | `{ [eleveId]: "present" \| "absent" \| "retard" }` → `{ notifies }` (parents notifiés) | Appel d'une classe |
| POST | `/presences/classes/{classeId}/relance` | — | Relancer l'appel |
| GET | `/presences/retards-sorties` | — (jour courant) | Retards et sorties |
| POST | `/presences/retards-sorties` | `{ eleveId, type, heure, motif }` | Retards et sorties |
| GET | `/presences/retards-repetes` | — | Retards et sorties |
| GET | `/justificatifs` | `statut` (`en_attente` ou `traites`) | Justificatifs |
| PUT | `/justificatifs/{id}` | `{ decision: "accepte" \| "refuse" }` (parent notifié) | Justificatifs |

## 9. Notes et bulletins

| Méthode | Chemin | Paramètres / corps | Écran |
|---|---|---|---|
| GET | `/bulletins/suivi` | `vue` (`sequence`/`trimestre`), `numero` | Notes et bulletins |
| GET | `/bulletins/classes/{classeId}` | `sequence` (moyennes, rangs, appréciations calculés) | Aperçu des bulletins |
| POST | `/bulletins/sequences/{n}/valider` | `{ classeIds }` | Valider |
| POST | `/bulletins/sequences/{n}/publier` | `{ classeIds }` (parents notifiés) | Publier |
| POST | `/bulletins/sequences/{n}/generer` | — | Générer les bulletins |
| POST | `/bulletins/sequences/{n}/cloturer` | — | Clôturer la saisie |
| POST | `/bulletins/classes/{classeId}/relance` | — | Relancer les enseignants |

## 10. Finances

| Méthode | Chemin | Paramètres / corps | Écran |
|---|---|---|---|
| GET | `/finances/tarifs` | — (tarifs avec effectifs + remises) | Tarifs |
| PUT | `/finances/tarifs/{niveau}` | `{ niveau, montant, versements: [{ libelle, montant, dateLimite }] }` (somme des versements = montant) | Tarifs |
| PUT | `/finances/remises` | `{ id?, libelle, taux }` | Tarifs |
| GET | `/finances/eleves` | `q` (recherche avec situation) | Situation élève |
| GET | `/finances/eleves/{id}` | — (`SituationFinanciere`) | Situation élève |
| PUT | `/finances/eleves/{id}/remise` | `{ remiseId }` | Situation élève |
| POST | `/finances/paiements` | `{ eleveId, montant, mode, reference }` → `{ id, numeroRecu, solde }` (400 si montant > solde) | Enregistrer un paiement |
| GET | `/finances/paiements/{id}` | — (paiement, situation, établissement) | Reçu |
| POST | `/finances/paiements/{id}/recu/envoyer` | — | Envoyer au parent |
| POST | `/finances/paiements/{id}/annulation` | `{ motif }` | Demander l'annulation |
| GET | `/finances/paiements/annulations` | — | Rapports financiers (direction) |
| POST | `/finances/paiements/{id}/annulation/{decision}` | `decision` = `valider` ou `refuser` (direction) | Rapports financiers |
| GET | `/finances/declarations` | — | Déclarations |
| POST | `/finances/declarations/{id}/{decision}` | `decision` = `valider` (émet le reçu) ou `rejeter` | Déclarations |
| GET | `/finances/impayes` | `filtre` (`7`, `30`), `q`, `page` | Impayés |
| POST | `/finances/relances` | `{ eleveIds }` | Relancer un parent |
| POST | `/finances/relances/tous` | — | Relancer tous |
| GET | `/finances/caisse/jour` | — | Tableau de bord comptable |
| POST | `/finances/caisse/cloturer` | — (409 si déjà clôturée) | Clôturer la caisse |
| GET | `/finances/rapports` | — (attendu, encaissé, par mois, par mode, caisse des 10 derniers jours) | Rapports |

## 11. Communication et support

| Méthode | Chemin | Paramètres / corps | Écran |
|---|---|---|---|
| GET | `/annonces` | `auteur` (`direction`/`surveillant`) | Annonces |
| POST | `/annonces` | `{ titre, message, type, cible, classeIds, canaux, mode, date? }` (`mode` = `publier`, `programmer`, `brouillon`) | Nouvelle annonce |
| POST | `/annonces/{id}/publier` | — | Publier un brouillon |
| DELETE | `/annonces/{id}` | — | Supprimer un brouillon |
| GET | `/notifications` | `filtre` (`toutes`, `non_lues`, `archivees`) | Notifications |
| POST | `/notifications/tout-lu` | — | Notifications |
| POST | `/notifications/{id}/lue` | — | Notifications |
| POST | `/notifications/{id}/archiver` | — | Notifications |
| GET | `/notifications/preferences` | — | Préférences |
| PUT | `/notifications/preferences` | `{ actifs: [type] }` | Préférences |
| GET | `/support/tickets` | — (tickets de l'établissement) | Support (direction) |
| POST | `/support/tickets` | `{ type, module, objet, description }` → `{ numero }` | Support (direction) |

## 12. Fichiers et exports

| Méthode | Chemin | Usage |
|---|---|---|
| GET | `/exports/{type}` | `eleves`, `personnel`, `assiduite-personnel`, `bulletins`, `impayes`, `paiements-du-jour`, `paiements`, `rapport-financier` : fichier CSV ou Excel renvoyé tel quel au navigateur |
| GET | `/fichiers/{chemin}` | bulletins PDF, reçus, pièces justificatives, relayés par `/api/fichiers/...` |
