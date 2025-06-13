const bcrypt = require('bcrypt'); // Module pour hacher les mots de passe
const jwt = require('jsonwebtoken'); // Module pour générer des tokens d'authentification
const User = require('../models/user'); // Modèle utilisateur MongoDB via Mongoose

// ---------------------------------------------------------------------
// POST /api/auth/signup
// Inscription d’un nouvel utilisateur
// ---------------------------------------------------------------------
exports.signup = (req, res) => {
  const { email, password } = req.body;

  // Vérifie que les champs email et mot de passe sont bien fournis
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  // Hachage du mot de passe avec un coût de 10 (temps de calcul)
  bcrypt
    .hash(password, 10)
    .then((hash) => {
      // Création d’un nouvel utilisateur avec l’email fourni et le mot de passe haché
      const user = new User({ email, password: hash });

      // Enregistrement dans la base de données
      return user.save();
    })
    .then(() => {
      // Réponse de succès après enregistrement
      res.status(201).json({ message: 'Utilisateur créé avec succès' });
    })
    .catch((error) => {
      // Si l’email est déjà utilisé, MongoDB renvoie une erreur avec le code 11000
      if (error.code === 11000) {
        return res.status(400).json({ error: 'Email déjà utilisé' });
      }

      // Autres erreurs lors de la création
      console.error('Erreur lors de la création :', error.message);
      res.status(400).json({ error: "Erreur lors de la création de l'utilisateur." });
    });
};

// ---------------------------------------------------------------------
// POST /api/auth/login
// Connexion d’un utilisateur existant
// ---------------------------------------------------------------------
exports.login = (req, res) => {
  const { email, password } = req.body;

  // Vérifie la présence des champs requis
  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe requis.' });
  }

  // Recherche de l’utilisateur par email
  User.findOne({ email })
    .then((user) => {
      if (!user) {
        // Si aucun utilisateur trouvé, on retourne une erreur d’authentification
        return res.status(401).json({ error: 'Utilisateur non trouvé' });
      }

      // Comparaison du mot de passe saisi avec le mot de passe haché stocké en base
      return bcrypt.compare(password, user.password).then((valid) => {
        if (!valid) {
          // Mot de passe incorrect
          return res.status(401).json({ error: 'Mot de passe incorrect' });
        }

        // Génération d’un token JWT contenant l’ID de l’utilisateur
        const token = jwt.sign(
          { userId: user._id },                  // Charge utile (payload)
          process.env.TOKEN_SECRET,              // Clé secrète pour signer le token
          { expiresIn: '24h' }                   // Durée de validité du token
        );

        // Réponse avec l’ID utilisateur et le token JWT
        res.status(200).json({ userId: user._id, token });
      });
    })
    .catch((error) => {
      // Erreur serveur inattendue lors du processus de connexion
      console.error('Erreur lors du login :', error.message);
      res.status(500).json({ error: 'Erreur serveur lors de l’authentification.' });
    });
};
