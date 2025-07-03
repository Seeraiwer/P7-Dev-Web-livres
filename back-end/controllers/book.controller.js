const Book = require("../models/book");
const fs = require("fs");
const path = require("path");

// -----------------------------------------------------------------------------
// POST /api/books
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
    res.status(201).json({ ...book.toObject(), id: book._id.toString() });
  } catch (error) {
    console.error("Erreur création livre :", error.message);
    res.status(400).json({ error: error.message });
  }
};

// -----------------------------------------------------------------------------
// GET /api/books
// -----------------------------------------------------------------------------
exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.find();
    res.status(200).json(
      books.map(book => ({ ...book.toObject(), id: book._id.toString() }))
    );
  } catch (error) {
    console.error("Erreur récupération livres :", error.message);
    res.status(400).json({ error: error.message });
  }
};

// -----------------------------------------------------------------------------
// GET /api/books/:id
// -----------------------------------------------------------------------------
exports.getOneBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: "Livre non trouvé" });

    res.status(200).json({ ...book.toObject(), id: book._id.toString() });
  } catch (error) {
    console.error("Erreur récupération livre :", error.message);
    res.status(400).json({ error: error.message });
  }
};

// -----------------------------------------------------------------------------
// PUT /api/books/:id
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
        } catch (err) {
          console.warn(`Erreur suppression image : ${err.message}`);
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
    res.status(200).json({ message: "Livre modifié", book: { ...updatedBook.toObject(), id: updatedBook._id.toString() } });
  } catch (error) {
    console.error("Erreur modification livre :", error.message);
    res.status(500).json({ error: error.message });
  }
};

// -----------------------------------------------------------------------------
// DELETE /api/books/:id
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
    res.status(200).json({ ...updatedBook.toObject(), id: updatedBook._id.toString() });
  } catch (error) {
    console.error("Erreur notation :", error.message);
    res.status(500).json({ error: error.message });
  }
};

// -----------------------------------------------------------------------------
// GET /api/books/bestrating
// -----------------------------------------------------------------------------
exports.getBestRatedBooks = async (req, res) => {
  try {
    const bestRatedBooks = await Book.find()
      .sort({ averageRating: -1 })
      .limit(10);

    res.status(200).json(
      bestRatedBooks.map(book => ({ ...book.toObject(), id: book._id.toString() }))
    );
  } catch (error) {
    console.error("Erreur récupération meilleurs livres :", error.message);
    res.status(500).json({ error: error.message });
  }
};
