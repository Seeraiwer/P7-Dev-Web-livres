const Book = require('../models/book');
const fs = require('fs');
const path = require('path');
const formatBook = require('../utils/formatBook');

// -------------------------------------------
// POST /api/books
// Crée un nouveau livre avec image et notation initiale
// -------------------------------------------
exports.createBook = async (req, res) => {
  try {
    const bookObject = JSON.parse(req.body.book);
    const filename = req.file.filename;

    const initialRating = Math.min(Math.max(bookObject.averageRating || 0, 0), 5);

    const book = new Book({
      ...bookObject,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${filename}`,
      userId: req.auth.userId,
      ratings: [{
        userId: req.auth.userId,
        grade: initialRating,
      }],
      averageRating: initialRating,
    });

    await book.save();
    res.status(201).json(formatBook(book));
  } catch (error) {
    console.error('Erreur création livre :', error.message);
    res.status(400).json({ error: error.message });
  }
};

// -------------------------------------------
// GET /api/books
// Récupère tous les livres
// -------------------------------------------
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books.map(formatBook));
  } catch (error) {
    console.error('Erreur récupération livres :', error.message);
    res.status(400).json({ error: error.message });
  }
};

// -------------------------------------------
// GET /api/books/:id
// Récupère un livre par son ID
// -------------------------------------------
exports.getOneBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Livre non trouvé' });

    res.status(200).json(formatBook(book));
  } catch (error) {
    console.error('Erreur récupération livre :', error.message);
    res.status(400).json({ error: error.message });
  }
};

// -------------------------------------------
// PUT /api/books/:id
// Modifie un livre (et remplace l’image si fournie)
// -------------------------------------------
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Livre non trouvé' });
    if (book.userId !== req.auth.userId)
      return res.status(403).json({ error: 'Requête non autorisée' });

    const updatedData = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
        }
      : req.body;

    // Supprimer l’ancienne image si une nouvelle a été envoyée
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

// -------------------------------------------
// DELETE /api/books/:id
// Supprime un livre et son image associée
// -------------------------------------------
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Livre non trouvé' });
    if (book.userId !== req.auth.userId)
      return res.status(403).json({ error: 'Requête non autorisée' });

    const filename = book.imageUrl.split('/images/')[1];

    await fs.promises.unlink(`images/${filename}`);
    await Book.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: 'Livre supprimé' });
  } catch (error) {
    console.error('Erreur suppression livre :', error.message);
    res.status(500).json({ error: error.message });
  }
};

// -------------------------------------------
// POST /api/books/:id/rating
// Ajoute une notation utilisateur à un livre
// -------------------------------------------
exports.rateBook = async (req, res) => {
  const { userId, rating } = req.body;

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

    // Ajoute la nouvelle note
    book.ratings.push({ userId, grade: rating });

    // Recalcule la note moyenne
    const total = book.ratings.reduce((sum, r) => sum + r.grade, 0);
    book.averageRating = total / book.ratings.length;

    const updatedBook = await book.save();
    res.status(200).json(formatBook(updatedBook));
  } catch (error) {
    console.error('Erreur lors de la notation :', error.message);
    res.status(500).json({ error: error.message });
  }
};

// -------------------------------------------
// GET /api/books/bestrating
// Récupère les 10 livres les mieux notés
// -------------------------------------------
exports.getBestRatedBooks = async (req, res) => {
  try {
    const bestRatedBooks = await Book.find()
      .sort({ averageRating: -1 })
      .limit(10);

    res.status(200).json(bestRatedBooks.map(formatBook));
  } catch (error) {
    console.error('Erreur récupération meilleurs livres :', error.message);
    res.status(500).json({ error: error.message });
  }
};
