const express = require('express');
const { body, validationResult } = require('express-validator'); // Middleware de validation des entrées

const router = express.Router();
const authCtrl = require('../controllers/auth.controller');

// -----------------------------------------------------------------------------
// Route POST /signup — Inscription d’un nouvel utilisateur
// -----------------------------------------------------------------------------
router.post(
  '/signup',
  [
    // Validation : champ 'email' requis et bien formaté
    body('email')
      .isEmail()
      .withMessage('Email invalide'),

    // Validation : champ 'password' d’au moins 6 caractères
    body('password')
      .isLength({ min: 6 })
      .withMessage('Le mot de passe doit comporter au moins 6 caractères'),
  ],
  // Middleware de validation : capture et renvoie les erreurs de validation
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      // Si des erreurs sont présentes, renvoie un tableau des erreurs
      return res.status(400).json({ errors: errors.array() });
    }

    // Si tout est valide, on passe au contrôleur
    next();
  },
  // Contrôleur : création de l’utilisateur en base
  authCtrl.signup
);

// -----------------------------------------------------------------------------
// Route POST /login — Connexion d’un utilisateur existant
// -----------------------------------------------------------------------------
router.post(
  '/login',
  [
    // Validation : email bien formé requis
    body('email')
      .isEmail()
      .withMessage('Email invalide'),

    // Validation : mot de passe non vide
    body('password')
      .notEmpty()
      .withMessage('Le mot de passe est requis'),
  ],
  // Middleware de validation des champs d’entrée
  (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    next(); // Passage au contrôleur si validation OK
  },
  // Contrôleur : vérifie les identifiants et génère un token
  authCtrl.login
);

module.exports = router;
