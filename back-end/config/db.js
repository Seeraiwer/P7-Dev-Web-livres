// -----------------------------------------------------------------------------
// Chargement des variables d’environnement depuis le fichier .env
// -----------------------------------------------------------------------------
require('dotenv').config();

const mongoose = require('mongoose');

// -----------------------------------------------------------------------------
// Fonction de connexion à MongoDB, à appeler au lancement de l’application
// -----------------------------------------------------------------------------
exports.connect = () => {
  const uri = process.env.MONGODB_URI; // URI MongoDB définie dans .env

  // Vérifie que l’URI est bien définie avant de tenter une connexion
  if (!uri) {
    console.error('Variable MONGODB_URI manquante dans .env');
    process.exit(1); // Arrêt immédiat si la config est invalide (évite crash silencieux plus tard)
  }

  // Connexion à MongoDB via Mongoose avec options de timeout explicites
  mongoose
    .connect(uri, {
      connectTimeoutMS: 30000,           // Maximum 30 secondes pour établir une connexion initiale
      serverSelectionTimeoutMS: 30000,   // Maximum 30 secondes pour détecter un serveur Mongo valide
    })
    .then(() => {
      console.log('Connexion MongoDB réussie'); // Connexion établie avec succès
    })
    .catch((err) => {
      // Si échec de la connexion : log explicite + arrêt complet
      console.error('Échec de la connexion MongoDB :', err.message);
      process.exit(1);
    });
};
