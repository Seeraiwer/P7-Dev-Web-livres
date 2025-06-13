const express = require('express');
const router = express.Router();

const auth = require('../middlewares/auth'); // Vérifie la validité du token JWT
const multer = require('../middlewares/multer-config'); // Gestion des fichiers images uploadés (via Multer)
const optimizeImage = require('../middlewares/optimizeImage'); // Compression et redimensionnement des images via Sharp
const bookCtrl = require('../controllers/book.controller'); // Logique métier associée aux livres
const Book = require('../models/book'); // Modèle Mongoose pour la collection "Book"

// -----------------------------------------------------------------------------
// Middleware custom : vérifie que l’utilisateur connecté est le propriétaire du livre
// -----------------------------------------------------------------------------
// Ce middleware protège les routes sensibles : modification et suppression
const checkOwnership = (req, res, next) => {
  const bookId = req.params.id;

  Book.findById(bookId)
    .then((book) => {
      if (!book) {
        return res.status(404).json({ error: 'Livre introuvable' });
      }
      if (book.userId !== req.auth.userId) {
        return res.status(403).json({
          error: "Accès interdit : vous n'êtes pas le propriétaire de ce livre",
        });
      }
      next(); // L'utilisateur est bien le propriétaire → on continue
    })
    .catch((error) => res.status(500).json({ error }));
};

//
// ----------------------------
// ROUTES PUBLIQUES (accès libre)
// ----------------------------
//

// GET /api/books — Récupère tous les livres
router.get('/', bookCtrl.getAllBooks);

// GET /api/books/bestrating — Récupère les 10 livres les mieux notés
router.get('/bestrating', bookCtrl.getBestRatedBooks);

// GET /api/books/:id — Récupère un livre par son identifiant
router.get('/:id', bookCtrl.getOneBook);

//
// ----------------------------
// ROUTES PROTÉGÉES (authentification requise)
// ----------------------------
//

// POST /api/books — Création d’un nouveau livre avec image
router.post(
  '/',
  auth,                // Vérifie l’authentification JWT
  multer,              // Gère l’upload du fichier image
  (req, res, next) => {
    // Vérifie si Multer a rejeté un fichier invalide (ex : mauvais format)
    if (req.fileValidationError) {
      return res.status(400).json({ error: req.fileValidationError });
    }
    next();
  },
  optimizeImage,       // Redimensionne et compresse l’image avec Sharp
  bookCtrl.createBook  // Logique de création (enregistrement BDD)
);

// PUT /api/books/:id — Modification d’un livre (avec option image)
router.put(
  '/:id',
  auth,                // Vérifie l’identité du demandeur
  multer,              // Gère l’upload d’une nouvelle image (si fournie)
  optimizeImage,       // Optimisation de la nouvelle image
  checkOwnership,      // Vérifie que l’utilisateur est le propriétaire du livre
  bookCtrl.updateBook  // Met à jour les champs du livre
);

// DELETE /api/books/:id — Suppression d’un livre
router.delete(
  '/:id',
  auth,                // Authentification requise
  checkOwnership,      // Seul le créateur peut supprimer son livre
  bookCtrl.deleteBook
);

// POST /api/books/:id/rating — Ajout d’une note à un livre
router.post(
  '/:id/rating',
  auth,                // Seul un utilisateur connecté peut noter un livre
  bookCtrl.rateBook
);

module.exports = router;
