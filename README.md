# SchoolConnect — application web

Plateforme de gestion des établissements secondaires camerounais (UCAC-ICAM, Groupe 5).
L'application web couvre les espaces **super-administrateur, direction, secrétariat, surveillance générale et
comptabilité**. Les enseignants, parents et élèves utilisent l'application mobile.

## Démarrer

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000 : l'application redirige vers `/fr/connexion`.

Par défaut, l'application tourne en **mode données d'exemple** (aucune API nécessaire). Les données reprennent les
maquettes (Lycée bilingue de Bafoussam). Elles vivent en mémoire et se réinitialisent au redémarrage du serveur.

### Comptes de démonstration

Mot de passe : `demo1234` (ou cliquez sur un compte sous le formulaire de connexion).

| Rôle | Identifiant |
|---|---|
| Super-administrateur | admin@schoolconnect.cm |
| Directeur | p.nkeng@lycee-bafoussam.cm |
| Secrétaire | j.tchoua@lycee-bafoussam.cm |
| Surveillant général | e.owona@lycee-bafoussam.cm |
| Comptable | m.biloa@lycee-bafoussam.cm |

## Brancher l'API Spring Boot

Copier `.env.example` en `.env.local`, puis :

```
USE_MOCK_API=false
API_URL=https://api.schoolconnect.cm/api/v1
SESSION_SECRET=<32 caractères aléatoires ou plus>
```

Les chemins d'API attendus sont écrits dans chaque `src/features/*/queries.ts` et `actions.ts`.

## Scripts

| Commande | Rôle |
|---|---|
| `npm run dev` | serveur de développement |
| `npm run build` | build de production (vérifie aussi les types) |
| `npm start` | serveur de production |
| `npm run lint` | ESLint |

## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — architecture, routes par rôle, modules, sécurité, conventions.
- Next.js 16 : lire `node_modules/next/dist/docs/` avant de modifier le code (voir `AGENTS.md`).
