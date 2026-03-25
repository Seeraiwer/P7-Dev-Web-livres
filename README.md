# P7-Dev-Web-livres
Application web pour découvrir, noter et partager des livres.
=======

## Description

MPM permet aux utilisateurs de :
- Créer un compte et se connecter
- Ajouter, modifier et supprimer leurs livres
- Joindre une image de couverture
- Noter et consulter les livres (moyenne affichée)

Architecture : **MongoDB + Express + React + Node.js (MERN)**.

## Fonctionnalités principales

- Authentification par **JWT**
- API RESTful (CRUD + notes)
- Upload d'images avec **Multer** (stockage local)
- Backend : Express + Mongoose
- Frontend : React (create-react-app)

## Installation

### Prérequis

- Node.js >= 18
- MongoDB accessible (local ou distant)
- `npm` ou `yarn`

### Backend

```bash
cd back-end
npm install
# Créer un fichier .env à la racine de back-end contenant :
# MONGODB_URI=<votre_URI_MongoDB>
# TOKEN_SECRET=<secret_pour_jwt>
# PORT=<port_optionnel>
npm start
```

### Frontend

```bash
cd front-end
npm install
npm start
```

## Variables d'environnement importantes

- `MONGODB_URI` : chaîne de connexion MongoDB
- `TOKEN_SECRET` : secret utilisé pour signer les JWT
- `PORT` : port d'écoute du serveur (optionnel)

## Sécurité

- Mots de passe hachés avec `bcrypt`
- Routes protégées par middleware JWT

## Notes opérationnelles

- Les images uploadées sont stockées dans le dossier `images/` (créé à l'exécution).
- Le dépôt contient des dossiers `back-end` et `front-end` distincts.
