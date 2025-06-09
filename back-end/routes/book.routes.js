const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth'); // Middleware d'authentification
const multer = require('../middlewares/multer-config'); // Gestion des fichiers uploadés
const optimizeImage = require('../middlewares/optimizeImage'); // Compression d’image
const bookCtrl = require('../controllers/book.controller'); // Logique métier des livres
const Book = require('../models/book'); // Modèle Mongoose pour accéder à la base

/**
 * Middleware pour vérifier que l'utilisateur est bien le propriétaire du livre.
 * Utilisé avant les opérations sensibles (modification, suppression).
 */
const checkOwnership = (req, res, next) => {
  const bookId = req.params.id;

  Book.findById(bookId)
    .then((book) => {
      // Vérifie que le livre appartient bien à l'utilisateur connecté
      if (!book) {
        return res.status(404).json({ error: 'Livre introuvable' });
      }
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({
          error: "Accès interdit : vous n'êtes pas le propriétaire de ce livre",
        });
      }
      next();
    })
    .catch((error) => res.status(500).json({ error }));
};

//
// ROUTES PUBLIQUES (aucune authentification requise)
//

// Récupère tous les livres
router.get('/', bookCtrl.getAllBooks);

// Récupère les livres les mieux notés
router.get('/bestrating', bookCtrl.getBestRatedBooks);

// Récupère un livre spécifique par son ID
router.get('/:id', bookCtrl.getOneBook);

//
// ROUTES PROTÉGÉES (authentification requise)
//

// Création d’un livre avec upload + optimisation de l’image
router.post(
  '/',
  auth,
  multer,
  // Vérifie si le fichier est invalide (bloqué par Multer)
  (req, res, next) => {
    if (req.fileValidationError) {
      return res.status(400).json({ error: req.fileValidationError });
    }
    next();
  },
  optimizeImage, // Réduction de taille avec Sharp
  bookCtrl.createBook
);

// Modification d’un livre existant (propriétaire uniquement)
router.put(
  '/:id',
  auth,
  multer,
  optimizeImage,
  checkOwnership, // Seul le propriétaire peut modifier
  bookCtrl.updateBook
);

// Suppression d’un livre (propriétaire uniquement)
router.delete(
  '/:id',
  auth,
  checkOwnership, // Vérifie la propriété du livre
  bookCtrl.deleteBook
);

// Notation d’un livre
router.post(
  '/:id/rating',
  auth,
  bookCtrl.rateBook
);

module.exports = router;
