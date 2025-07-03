# MPM - Mon Petit Monde du Livre

> Une application web moderne pour découvrir, noter et partager des livres.

---

## Description

MPM est une plateforme web permettant aux utilisateurs de :
- Créer un compte et se connecter
- Ajouter leurs propres livres
- Noter et consulter des livres existants
- Modifier ou supprimer les livres qu'ils ont ajoutés
- Joindre une image de couverture
- Voir les livres les mieux notés

Le projet est conçu avec une architecture **MERN** (MongoDB, Express, React, Node.js) et respecte des pratiques de développement **durables et sécurisées**.

---

## Fonctionnalités principales

- Authentification sécurisée avec **JWT**
- API RESTful complète (CRUD + notation)
- Stockage MongoDB avec modèles Mongoose
- Approche green code (optimisation images, SPA, stateless)
- Upload d’image avec **Multer**
- Calcul dynamique de la note moyenne (arrondie à 2 décimales)
- Frontend en React avec routing (`react-router-dom`) et composants modulaires

---

## Installation

### Prérequis

- Node.js >= 18
- MongoDB (local ou distant)
- npm ou yarn

#### Installer le backend

```bash
cd backend
npm install
cp .env.example .env
# Remplir les variables (MONGO_URI, JWT_SECRET, etc.)
npm run start
```

#### Installer le frontend

```bash
cd ../frontend
npm install
npm run dev
```

## Sécurité

- Authentification **JWT**
- Mots de passe **hachés avec bcrypt**
- Middleware d’autorisation pour les routes protégées

---

## Green Code

- Stateless : aucune session serveur conservée
- Optimisation images (taille réduite)
- SPA : Single Page Application légère
- Frontend modulaire, composants ciblés
- État local réduit à l’essentiel

---
