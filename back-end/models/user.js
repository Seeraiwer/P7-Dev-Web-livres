const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// -----------------------------------------------------------------------------
// Schéma utilisateur : représente les comptes dans la base MongoDB
// -----------------------------------------------------------------------------
const userSchema = mongoose.Schema({
  // Adresse email de l’utilisateur
  email: {
    type: String,
    required: [true, 'L’adresse email est obligatoire'], // Email obligatoire
    unique: true, // Doit être unique dans la collection
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/, // Regex de validation
      'Veuillez entrer un email valide', // Message en cas d’email invalide
    ],
  },
  // Mot de passe de l’utilisateur (haché dans les contrôleurs)
  password: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire'], // Champ obligatoire
    // La complexité du mot de passe (longueur, majuscules, etc.) est à valider côté contrôleur ou frontend
  },
});

// -----------------------------------------------------------------------------
// Plugin mongoose-unique-validator
// Permet de personnaliser les messages d’erreurs sur les champs uniques
// -----------------------------------------------------------------------------
userSchema.plugin(uniqueValidator, {
  message: '{PATH} doit être unique', // Affiche "email doit être unique" en cas de doublon
});

// -----------------------------------------------------------------------------
// Exportation du modèle Mongoose "User"
// Utilisé dans les routes d’inscription et de connexion
// -----------------------------------------------------------------------------
module.exports = mongoose.model('User', userSchema);
