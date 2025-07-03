const Book = require('../models/book'); // Modèle Mongoose pour les livres
const fs = require('fs'); // Module Node.js pour manipuler les fichiers
const path = require('path'); // Utilitaire pour manipuler les chemins de fichiers
const formatBook = require('../utils/formatBook'); // Fonction utilitaire pour uniformiser le format des réponses

// -----------------------------------------------------------------------------
// POST /api/books
// Crée un nouveau livre avec une image et une note initiale
// -----------------------------------------------------------------------------
exports.createBook = async (req, res) => {
  try {
    const bookObject = JSON.parse(req.body.book); // Récupère les données du livre depuis le corps de la requête
    const filename = req.file.filename; // Nom du fichier image envoyé

    const initialRating = Math.min(Math.max(bookObject.averageRating || 0, 0), 5); // Note initiale bornée entre 0 et 5

    const book = new Book({
      ...bookObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${filename}`, // URL complète de l'image
      userId: req.auth.userId, // ID de l'utilisateur authentifié
      ratings: [{
        userId: req.auth.userId,
        grade: initialRating,
      }],
      averageRating: initialRating,
    });

    await book.save(); // Sauvegarde dans la base de données
    res.status(201).json(formatBook(book)); // Réponse formatée
  } catch (error) {
    console.error('Erreur création livre :', error.message);
    res.status(400).json({ error: error.message });
  }
};

// -----------------------------------------------------------------------------
// GET /api/books
// Récupère l’ensemble des livres de la base
// -----------------------------------------------------------------------------
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find(); // Récupération de tous les documents Book
    res.status(200).json(books.map(formatBook)); // Formatage et envoi
  } catch (error) {
    console.error('Erreur récupération livres :', error.message);
    res.status(400).json({ error: error.message });
  }
};

// -----------------------------------------------------------------------------
// GET /api/books/:id
// Récupère un livre spécifique par son identifiant
// -----------------------------------------------------------------------------
exports.getOneBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id); // Recherche par ID
    if (!book) return res.status(404).json({ error: 'Livre non trouvé' });

    res.status(200).json(formatBook(book));
  } catch (error) {
    console.error('Erreur récupération livre :', error.message);
    res.status(400).json({ error: error.message });
  }
};

// -----------------------------------------------------------------------------
// PUT /api/books/:id
// Met à jour les données d’un livre (remplace aussi l’image si fournie)
// -----------------------------------------------------------------------------
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id); // Récupération du livre existant
    if (!book) return res.status(404).json({ error: 'Livre non trouvé' });

    // Vérifie si l'utilisateur est bien le créateur du livre
    if (book.userId !== req.auth.userId) {
      return res.status(403).json({ error: 'Requête non autorisée' });
    }

    // Prépare les nouvelles données, en tenant compte d'une éventuelle nouvelle image
    const updatedData = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        }
      : req.body;

    // Si une nouvelle image est fournie, supprime l'ancienne
    if (req.file && book.imageUrl) {
      const oldFilename = book.imageUrl.split('/images/')[1];
      fs.unlink(`images/${oldFilename}`, async (err) => {
        if (err) console.warn('Erreur suppression ancienne image :', err.message);

        await Book.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        res.status(200).json({ message: 'Livre modifié avec image' });
      });
    } else {
      await Book.findByIdAndUpdate(req.params.id, updatedData, { new: true });
      res.status(200).json({ message: 'Livre modifié' });
    }
  } catch (error) {
    console.error('Erreur modification livre :', error.message);
    res.status(500).json({ error: error.message });
  }
};

// -----------------------------------------------------------------------------
// DELETE /api/books/:id
// Supprime un livre et son fichier image associé
// -----------------------------------------------------------------------------
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id); // Récupère le livre
    if (!book) return res.status(404).json({ error: 'Livre non trouvé' });

    // Vérifie les droits de suppression
    if (book.userId !== req.auth.userId) {
      return res.status(403).json({ error: 'Requête non autorisée' });
    }

    const filename = book.imageUrl.split('/images/')[1]; // Extraction du nom de l’image

    // Suppression du fichier image
    await fs.promises.unlink(`images/${filename}`);

    // Suppression du document MongoDB
    await Book.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Livre supprimé' });
  } catch (error) {
    console.error('Erreur suppression livre :', error.message);
    res.status(500).json({ error: error.message });
  }
};

// -----------------------------------------------------------------------------
// POST /api/books/:id/rating
// Ajoute une nouvelle note d’un utilisateur à un livre
// -----------------------------------------------------------------------------
exports.rateBook = async (req, res) => {
  const { rating } = req.body;
  const userId = req.auth.userId;

  if (rating < 0 || rating > 5) {
    return res.status(400).json({ error: 'Note invalide (0 à 5 requis)' });
  }

  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Livre non trouvé' });

    const alreadyRated = book.ratings.find(r => r.userId === userId);
    if (alreadyRated) {
      return res.status(400).json({ error: 'L’utilisateur a déjà noté ce livre' });
    }

    book.ratings.push({ userId, grade: rating });

    const total = book.ratings.reduce((sum, r) => sum + r.grade, 0);
    book.averageRating = parseFloat((total / book.ratings.length).toFixed(2));

    const updatedBook = await book.save();
    res.status(200).json(formatBook(updatedBook));
  } catch (error) {
    console.error('Erreur lors de la notation :', error.message);
    res.status(500).json({ error: error.message });
  }
};


// -----------------------------------------------------------------------------
// GET /api/books/bestrating
// Récupère les 10 livres ayant la meilleure note moyenne
// -----------------------------------------------------------------------------
exports.getBestRatedBooks = async (req, res) => {
  try {
    const bestRatedBooks = await Book.find()
      .sort({ averageRating: -1 }) // Tri décroissant sur la note moyenne
      .limit(10); // Limite à 10 résultats

    res.status(200).json(bestRatedBooks.map(formatBook));
  } catch (error) {
    console.error('Erreur récupération meilleurs livres :', error.message);
    res.status(500).json({ error: error.message });
  }
};
