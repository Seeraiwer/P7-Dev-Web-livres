const mongoose = require('mongoose');

// -----------------------------------------------------------------------------
// Sous-schéma : représentation d’une notation individuelle associée à un livre
// -----------------------------------------------------------------------------
const ratingSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true, // ID de l’utilisateur ayant donné une note
    },
    grade: {
      type: Number,
      required: true,
      min: [0, 'Note minimale = 0'], // Empêche des valeurs inférieures à 0
      max: [5, 'Note maximale = 5'], // Empêche des valeurs supérieures à 5
    },
  },
  {
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt pour chaque note
  }
);

// -----------------------------------------------------------------------------
// Schéma principal : structure d’un document "Livre" dans MongoDB
// -----------------------------------------------------------------------------
const bookSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true, // ID de l’utilisateur qui a créé le livre
    },
    title: {
      type: String,
      required: true,
      trim: true, // Supprime les espaces en début/fin
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true, // Lien absolu vers l’image hébergée sur le serveur
    },
    year: {
      type: Number,
      required: true,
      min: 0, // Évite les dates de publication invalides
    },
    genre: {
      type: String,
      required: true, // Catégorie ou style littéraire du livre
    },
    ratings: [ratingSchema], // Tableau de notations liées au livre
    averageRating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 0, // Valeur par défaut si aucune note n’a encore été attribuée
    },
  },
  {
    timestamps: true, // Ajoute createdAt et updatedAt pour le suivi du livre
  }
);

// Exportation du modèle Mongoose "Book"
module.exports = mongoose.model('Book', bookSchema);
