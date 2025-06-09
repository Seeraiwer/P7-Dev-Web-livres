const mongoose = require('mongoose');

// -------------------------------------------
// Sous-schéma : notation individuelle d’un livre
// -------------------------------------------
const ratingSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true, // identifiant de l'utilisateur notant le livre
    },
    grade: {
      type: Number,
      required: true,
      min: [0, 'Note minimale = 0'],
      max: [5, 'Note maximale = 5'],
    },
  },
  {
    timestamps: true, // createdAt et updatedAt pour chaque note (utile pour audit ou tri)
  }
);

// -------------------------------------------
// Schéma principal : modèle de livre
// -------------------------------------------
const bookSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true, // identifiant de l'utilisateur créateur du livre
    },
    title: {
      type: String,
      required: true,
      trim: true, // supprime les espaces inutiles autour du titre
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true, // URL publique du fichier image
    },
    year: {
      type: Number,
      required: true,
      min: 0, // empêche les années négatives
    },
    genre: {
      type: String,
      required: true,
    },
    ratings: [ratingSchema], // tableau de notations
    averageRating: {
      type: Number,
      required: true,
      min: 0,
      max: 5,
      default: 0, // note moyenne initiale
    },
  },
  {
    timestamps: true, // pour les livres : date de création / modification
  }
);

// Plugin de validation d’unicité (décommenter si un champ unique est ajouté)
// const uniqueValidator = require('mongoose-unique-validator');
// bookSchema.plugin(uniqueValidator);

module.exports = mongoose.model('Book', bookSchema);
