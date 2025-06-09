const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

// -------------------------------------------
// POST /api/auth/signup
// Inscription d’un nouvel utilisateur
// -------------------------------------------
exports.signup = (req, res) => {
  const { email, password } = req.body;

  // Vérifie la présence des champs obligatoires
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  // Hachage du mot de passe
  bcrypt
    .hash(password, 10)
    .then((hash) => {
      const user = new User({ email, password: hash });

      // Sauvegarde dans la base de données
      return user.save();
    })
    .then(() => {
      res.status(201).json({ message: 'Utilisateur créé avec succès' });
    })
    .catch((error) => {
      // Gestion d’un email déjà utilisé (erreur MongoDB : code 11000)
      if (error.code === 11000) {
        return res.status(400).json({ error: 'Email déjà utilisé' });
      }

      console.error('Erreur lors de la création :', error.message);
      res.status(400).json({ error: "Erreur lors de la création de l'utilisateur." });
    });
};

// -------------------------------------------
// POST /api/auth/login
// Connexion d’un utilisateur existant
// -------------------------------------------
exports.login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé' });
      }

      return bcrypt.compare(password, user.password).then((valid) => {
        if (!valid) {
          return res.status(401).json({ error: 'Mot de passe incorrect' });
        }

        const token = jwt.sign(
          { userId: user._id },
          process.env.TOKEN_SECRET,
          { expiresIn: '24h' }
        );

        res.status(200).json({ userId: user._id, token });
      });
    })
    .catch((error) => {
      console.error('Erreur lors du login :', error.message);
      res.status(500).json({ error: 'Erreur serveur lors de l’authentification.' });
    });
};
