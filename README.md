# ClinicFlow

Application web de gestion des patients et des rendez-vous d'une petite clinique.

**Stack :** PostgreSQL · Express · React · Node.js (PERN)

```
ClinicFlow/
├── database/
│   └── schema.sql      # Création des tables, contraintes et index
├── backend/            # API REST (Node + Express)
│   ├── scripts/seed.js # Données de démonstration
│   └── src/            # config / routes / controllers / services / middlewares / validators
└── frontend/           # Interface (React + Vite)
```

## Prérequis

| Outil | Version |
|---|---|
| Node.js | **22.22 ou plus** (exigé par React Router 8 côté frontend ; le backend seul fonctionne dès Node 18) |
| npm | fourni avec Node.js |
| PostgreSQL | **13 ou plus** (`gen_random_uuid()` est intégré à partir de la version 13) |

## Installation

### 1. Base de données

Créer une base vide nommée `clinicflow`, puis exécuter le script `database/schema.sql`.

**Avec pgAdmin :** clic droit sur *Databases* → *Create* → *Database…* → nom `clinicflow`.
Puis, sur la base `clinicflow` : *Query Tool* → ouvrir `database/schema.sql` → *Execute*.

**Avec psql :**

```bash
psql -U postgres -c "CREATE DATABASE clinicflow;"
psql -U postgres -d clinicflow -f database/schema.sql
```

Le script est idempotent (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`) : il peut être relancé sans erreur.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
```

Renseigner ensuite `backend/.env` :

| Variable | Description | Exemple |
|---|---|---|
| `PORT` | Port de l'API | `5000` |
| `DB_HOST` / `DB_PORT` | Serveur PostgreSQL | `localhost` / `5432` |
| `DB_USER` / `DB_PASSWORD` | Identifiants PostgreSQL | `postgres` / *votre mot de passe* |
| `DB_NAME` | Nom de la base | `clinicflow` |
| `JWT_SECRET` | Clé de signature des tokens (longue chaîne aléatoire) | — |
| `JWT_EXPIRES_IN` | Durée de validité d'un token | `1d` |
| `CLIENT_URL` | Origine du frontend autorisée par CORS | `http://localhost:5173` |

Le serveur refuse de démarrer si une variable obligatoire manque.

Charger les données de démonstration :

```bash
npm run seed
```

> ⚠️ Le seed **vide les tables** `appointments`, `patients` et `users` avant de réinsérer les données de démonstration.

Démarrer l'API :

```bash
npm run dev
```

→ `Connected to PostgreSQL` puis `Server running on http://localhost:5000`

### 3. Frontend

Dans un second terminal :

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

`frontend/.env` contient une seule variable, `VITE_API_URL` (URL de l'API, par défaut `http://localhost:5000`). Cette étape est facultative si l'API tourne sur ce port.

→ Ouvrir **http://localhost:5173**

## Comptes de démonstration

| Rôle | Email | Mot de passe |
|---|---|---|
| admin | admin@clinicflow.com | Admin123! |
| staff | sara@clinicflow.com | Staff123! |
| staff | karim@clinicflow.com | Staff123! |

Seul le rôle **admin** peut supprimer un patient. Les comptes sont créés uniquement par le seed : aucune route ne permet de créer un utilisateur ou de changer un rôle.

**Données de démonstration :** 5 patients et 10 rendez-vous (4 en attente, 4 confirmés, 2 annulés), datés par rapport au jour d'exécution du seed.

- **Règle des 30 minutes :** Youssef El Amrani a un rendez-vous confirmé à 09:00 et un en attente à 09:15 le jour du seed. Confirmer celui de 09:15 est refusé (400).
- **Suppression protégée :** tous les patients du seed ont des rendez-vous, leur suppression est donc refusée (409). Pour tester une suppression réussie, créer d'abord un nouveau patient.

## Commandes

| Dossier | Commande | Rôle |
|---|---|---|
| `backend/` | `npm run dev` | API en développement (redémarrage automatique avec nodemon) |
| `backend/` | `npm start` | API sans redémarrage automatique |
| `backend/` | `npm run seed` | Réinitialise les données de démonstration |
| `frontend/` | `npm run dev` | Interface en développement |
| `frontend/` | `npm run build` | Build de production dans `frontend/dist` |
| `frontend/` | `npm run preview` | Sert le build de production |
| `frontend/` | `npm run lint` | Analyse du code (oxlint) |

## API

Toutes les routes sauf `/api/auth/login` exigent l'en-tête `Authorization: Bearer <token>`.

| Méthode | Route | Description | Accès |
|---|---|---|---|
| POST | `/api/auth/login` | Connexion (email + mot de passe) → JWT | Public |
| GET | `/api/auth/me` | Utilisateur connecté | Authentifié |
| POST | `/api/patients` | Créer un patient | Authentifié |
| GET | `/api/patients?search=&page=&limit=` | Liste paginée, recherche par nom ou CIN | Authentifié |
| GET | `/api/patients/:id` | Détail d'un patient et ses rendez-vous | Authentifié |
| PUT | `/api/patients/:id` | Modifier un patient | Authentifié |
| DELETE | `/api/patients/:id` | Supprimer un patient (409 s'il a des rendez-vous) | Admin |
| POST | `/api/appointments` | Créer un rendez-vous (toujours `pending`) | Authentifié |
| GET | `/api/appointments?date=&status=` | Liste filtrée par date / statut | Authentifié |
| PATCH | `/api/appointments/:id/status` | Changer le statut (règle des 30 minutes) | Authentifié |
| GET | `/api/dashboard/stats` | Statistiques du tableau de bord | Authentifié |

Codes d'erreur : `400` données invalides ou règle métier · `401` non authentifié · `403` rôle insuffisant · `404` introuvable · `409` conflit (CIN déjà utilisé, patient avec rendez-vous) · `500` erreur serveur.

## À savoir

- Le token JWT est gardé **en mémoire** uniquement : recharger la page ramène à l'écran de connexion.
- Les dates et heures de rendez-vous sont en **heure locale de la clinique**, sans fuseau horaire (`2026-09-26T10:00`).
