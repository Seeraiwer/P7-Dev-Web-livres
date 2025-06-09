const express = require('express');
const { body, validationResult } = require('express-validator');

const router = express.Router();
const authCtrl = require('../controllers/auth.controller');

// Route POST /signup — inscription d’un utilisateur
router.post(
  '/signup',
  [
    // Validation : email valide requis
    body('email')
      .isEmail()
      .withMessage('Email invalide'),
    
    // Validation : mot de passe de minimum 6 caractères
    body('password')
      .isLength({ min: 6 })
      .withMessage('Le mot de passe doit comporter au moins 6 caractères'),
  ],
  // Middleware de traitement des erreurs de validation
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Si erreurs, on les retourne au client
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  // Appel au contrôleur
  authCtrl.signup
);

// Route POST /login — connexion utilisateur
router.post(
  '/login',
  [
    // Validation : email obligatoire et bien formaté
    body('email')
      .isEmail()
      .withMessage('Email invalide'),

    // Validation : mot de passe non vide
    body('password')
      .notEmpty()
      .withMessage('Le mot de passe est requis'),
  ],
  // Middleware de gestion des erreurs de validation
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // En cas d’erreurs, retour d’un tableau des erreurs
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
  // Appel au contrôleur
  authCtrl.login
);

module.exports = router;
