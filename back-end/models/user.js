const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Définition du schéma utilisateur
const userSchema = mongoose.Schema({
  // Champ email : requis, unique et avec validation de format
  email: {
    type: String,
    required: [true, 'L’adresse email est obligatoire'],
    unique: true, // Un utilisateur par email
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
      'Veuillez entrer un email valide',
    ],
  },
  // Champ mot de passe : requis
  password: {
    type: String,
    required: [true, 'Le mot de passe est obligatoire'],
  },
});

// Ajout du plugin pour valider les champs uniques
// Permet d’avoir un message d’erreur clair si un email est déjà utilisé
userSchema.plugin(uniqueValidator, { message: '{PATH} doit être unique' });

// Exportation du modèle User pour utilisation dans les routes/auth
module.exports = mongoose.model('User', userSchema);
