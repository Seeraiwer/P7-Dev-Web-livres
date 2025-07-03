const Book = require("../models/book");
const fs = require("fs");

// Fonction utilitaire pour générer les étoiles
const generateStars = (averageRating, bookId) => {
  const full = Math.floor(averageRating);
  const empty = 5 - full;

  return [
    ...Array.from({ length: full }, (_, i) => ({
      type: "full",
      id: `${bookId}-full-${i}`,
    })),
    ...Array.from({ length: empty }, (_, i) => ({
      type: "empty",
      id: `${bookId}-empty-${i}`,
    })),
  ];
};

// Fonction utilitaire pour formater un objet Book
const formatBook = (book) => {
  const bookObj = book.toObject();
  const bookId = bookObj._id.toString();

  return {
    ...bookObj,
    ratings: (bookObj.ratings || []).map(({ _id, ...rest }) => rest),
    stars: generateStars(bookObj.averageRating, bookId),
    id: bookId,
  };
};

// -----------------------------------------------------------------------------
// POST /api/books
// Crée un nouveau livre avec une image et une note initiale
// -----------------------------------------------------------------------------
exports.createBook = async (req, res) => {
  try {
    const bookObject = JSON.parse(req.body.book);
    const filename = req.file.filename;
    const initialRating = Math.min(Math.max(bookObject.averageRating || 0, 0), 5);

    const book = new Book({
      ...bookObject,
      imageUrl: `${req.protocol}://${req.get("host")}/images/${filename}`,
      userId: req.auth.userId,
      ratings: [
        {
          userId: req.auth.userId,
          grade: initialRating,
        },
      ],
      averageRating: initialRating,
    });

    await book.save();
    res.status(201).json(formatBook(book));
  } catch (error) {
    console.error("Erreur création livre :", error.message);
    res.status(400).json({ error: error.message });
  }
};

// -----------------------------------------------------------------------------
// GET /api/books
// Récupère l’ensemble des livres
// -----------------------------------------------------------------------------
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(books.map(formatBook));
  } catch (error) {
    console.error("Erreur récupération livres :", error.message);
    res.status(400).json({ error: error.message });
  }
};

// -----------------------------------------------------------------------------
// GET /api/books/:id
// Récupère un livre spécifique
// -----------------------------------------------------------------------------
exports.getOneBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Livre non trouvé" });

    res.status(200).json(formatBook(book));
  } catch (error) {
    console.error("Erreur récupération livre :", error.message);
    res.status(400).json({ error: error.message });
  }
};

// -----------------------------------------------------------------------------
// PUT /api/books/:id
// Met à jour les données d’un livre (remplace aussi l’image si fournie)
// -----------------------------------------------------------------------------
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Livre non trouvé" });

    if (book.userId !== req.auth.userId) {
      return res.status(403).json({ error: "Requête non autorisée" });
    }

    let updatedData;

    if (req.file) {
      const oldFilename = book.imageUrl?.split("/images/")[1];
      if (oldFilename) {
        try {
          await fs.promises.unlink(`images/${oldFilename}`);
          console.log(`Ancienne image supprimée : ${oldFilename}`);
        } catch (err) {
          console.warn(`Erreur suppression de l’image : ${err.message}`);
        }
      }

      updatedData = {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`,
      };
    } else {
      updatedData = req.body;
    }

    const updatedBook = await Book.findByIdAndUpdate(req.params.id, updatedData, { new: true });
    res.status(200).json({ message: "Livre modifié", book: formatBook(updatedBook) });
  } catch (error) {
    console.error("Erreur modification livre :", error.message);
    res.status(500).json({ error: error.message });
  }
};

// -----------------------------------------------------------------------------
// DELETE /api/books/:id
// Supprime un livre et son fichier image associé
// -----------------------------------------------------------------------------
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Livre non trouvé" });

    if (book.userId !== req.auth.userId) {
      return res.status(403).json({ error: "Requête non autorisée" });
    }

    const filename = book.imageUrl.split("/images/")[1];
    await fs.promises.unlink(`images/${filename}`);
    await Book.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Livre supprimé" });
  } catch (error) {
    console.error("Erreur suppression livre :", error.message);
    res.status(500).json({ error: error.message });
  }
};

// -----------------------------------------------------------------------------
// POST /api/books/:id/rating
// Ajoute une nouvelle note à un livre
// -----------------------------------------------------------------------------
exports.rateBook = async (req, res) => {
  const { rating } = req.body;
  const userId = req.auth.userId;

  if (rating < 0 || rating > 5) {
    return res.status(400).json({ error: "Note invalide (0 à 5 requis)" });
  }

  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Livre non trouvé" });

    const alreadyRated = book.ratings.find((r) => r.userId === userId);
    if (alreadyRated) {
      return res.status(400).json({ error: "L’utilisateur a déjà noté ce livre" });
    }

    book.ratings.push({ userId, grade: rating });

    const total = book.ratings.reduce((sum, r) => sum + r.grade, 0);
    book.averageRating = parseFloat((total / book.ratings.length).toFixed(2));

    const updatedBook = await book.save();
    res.status(200).json(formatBook(updatedBook));
  } catch (error) {
    console.error("Erreur lors de la notation :", error.message);
    res.status(500).json({ error: error.message });
  }
};

// -----------------------------------------------------------------------------
// GET /api/books/bestrating
// Récupère les 10 livres avec la meilleure note moyenne
// -----------------------------------------------------------------------------
exports.getBestRatedBooks = async (req, res) => {
  try {
    const bestRatedBooks = await Book.find().sort({ averageRating: -1 }).limit(10);
    res.status(200).json(bestRatedBooks.map(formatBook));
  } catch (error) {
    console.error("Erreur récupération meilleurs livres :", error.message);
    res.status(500).json({ error: error.message });
  }
};
