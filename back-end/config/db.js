require('dotenv').config(); // Charge les variables d’environnement depuis .env
const mongoose = require('mongoose');

exports.connect = () => {
const uri = process.env.MONGODB_URI;

  // Vérifie que la variable d’environnement est bien définie
  if (!uri) {
    console.error('Variable MONGODB_URI manquante dans .env');
    process.exit(1); // Arrêt immédiat du processus
  }

  // Connexion à MongoDB via Mongoose
  mongoose
    .connect(uri, {
      connectTimeoutMS: 30000,           // Temps max de tentative de connexion
      serverSelectionTimeoutMS: 30000,   // Temps max pour trouver un serveur valide
    })
    .then(() => {
      console.log('Connexion MongoDB réussie');
    })
    .catch((err) => {
      console.error('Échec de la connexion MongoDB :', err.message);
      process.exit(1); // Arrêt de l’application en cas d’échec
    });
};
