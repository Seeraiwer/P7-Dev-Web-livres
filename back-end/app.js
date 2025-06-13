// Importation des modules nécessaires à l'application
const express = require('express');          // Framework web minimaliste pour créer l'API
const mongoose = require('mongoose');        // ODM pour interagir avec MongoDB
const path = require('path');                // Utilitaires pour manipuler les chemins de fichiers
const cors = require('cors');                // Middleware pour gérer les politiques CORS
const helmet = require('helmet');            // Middleware pour renforcer la sécurité HTTP

// Importation des routeurs définissant les points d’entrée de l’API
const bookRoutes = require('./routes/book.routes');  // Routes pour la gestion des livres
const authRoutes = require('./routes/auth.routes');  // Routes pour l’authentification

// Import de la configuration de la base de données MongoDB (externalisée dans un fichier dédié)
const db = require('./config/db');

// Création de l'application Express
const app = express();

// Connexion à la base de données MongoDB via Mongoose
db.connect();

// Application de protections HTTP de base via Helmet
app.use(helmet()); // Ajoute automatiquement divers en-têtes pour améliorer la sécurité (ex : XSS, Content Security Policy, etc.)

// Configuration de CORS : autorise uniquement le frontend à l’adresse spécifiée à accéder à l’API
app.use(cors({
  origin: 'http://localhost:3000', // Autorise uniquement cette origine
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Méthodes HTTP autorisées
  allowedHeaders: ['Content-Type', 'Authorization'], // En-têtes autorisées (notamment pour les tokens JWT)
}));

// Middleware pour parser les données JSON des requêtes entrantes (corps des requêtes)
app.use(express.json());

// Middleware pour parser les données encodées en URL (soumissions de formulaires classiques)
app.use(express.urlencoded({ extended: true }));

// Configuration du dossier statique pour servir les fichiers images
app.use('/images', express.static(path.join(__dirname, 'images'), {
  setHeaders: (res, filePath) => {
    // Définit une politique permettant le chargement cross-origin des ressources (utile pour le frontend)
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Définition des routes principales de l'API REST
app.use('/api/books', bookRoutes); // Routes pour les opérations CRUD sur les livres
app.use('/api/auth', authRoutes);  // Routes pour l'inscription, la connexion, etc.

// Middleware global de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack); // Affiche la trace complète de l'erreur dans la console

  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? "Une erreur est survenue. Merci de réessayer plus tard." // Message générique en production
      : err.message, // Message détaillé pour le développement
  });
});

// Exportation de l'application Express pour qu'elle puisse être utilisée par le serveur HTTP
module.exports = app;
