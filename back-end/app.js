// Importation des modules nécessaires
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');

// Import des routes
const bookRoutes = require('./routes/book.routes');
const authRoutes = require('./routes/auth.routes');

// Configuration MongoDB externalisée
const db = require('./config/db');

const app = express();

// Connexion à la base de données MongoDB
db.connect();

// Middleware de sécurité HTTP
app.use(helmet()); // Ajoute des en-têtes de sécurité (ex. CSP, XSS protection, etc.)

// Middleware CORS – autorise uniquement le frontend local à communiquer
app.use(cors({
  origin: 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'], // JWT ou autre token dans l'en-tête
}));

// Middlewares pour parser les données entrantes
app.use(express.json()); // Parse les JSON dans les requêtes entrantes
app.use(express.urlencoded({ extended: true })); // Parse les données de formulaire (x-www-form-urlencoded)

// Middleware pour servir les fichiers statiques (images)
app.use('/images', express.static(path.join(__dirname, 'images'), {
  setHeaders: (res, filePath) => {
    // Permet le chargement d'images cross-origin 
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Routes de l'API
app.use('/api/books', bookRoutes);
app.use('/api/auth', authRoutes);

// Middleware global de gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack); // Log de l'erreur côté serveur
  res.status(500).json({
    error: process.env.NODE_ENV === 'production'
      ? "Une erreur est survenue. Merci de réessayer plus tard."
      : err.message,
  });
});

// Export de l'application pour le fichier server.js
module.exports = app;
