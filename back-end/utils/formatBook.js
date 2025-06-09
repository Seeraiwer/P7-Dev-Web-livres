// Génère un tableau d'étoiles pour l'affichage visuel basé sur la note moyenne
const generateStars = (averageRating, bookId) => {
  const full = Math.floor(averageRating); // Nombre d’étoiles pleines
  const empty = 5 - full;                 // Complément pour arriver à 5

  // Construit les étoiles pleines et vides avec un identifiant unique
  return [
    ...Array.from({ length: full }, (_, i) => ({
      type: 'full',
      id: `${bookId}-full-${i}`,
    })),
    ...Array.from({ length: empty }, (_, i) => ({
      type: 'empty',
      id: `${bookId}-empty-${i}`,
    })),
  ];
};

// Fonction de formatage d'un objet Book pour le frontend
module.exports = (book) => {
  // Assure la conversion en objet JS pur, même si on a un document Mongoose
  const bookObj = book.toObject?.() || book;

  // Génère un identifiant de secours si l'ID est absent
  const bookId =
    bookObj._id?.toString?.() || bookObj.id || `fallback-${Date.now()}-${Math.random()}`;

  return {
    _id: bookObj._id,               // Identifiant MongoDB
    title: bookObj.title,
    author: bookObj.author,
    imageUrl: bookObj.imageUrl,
    year: bookObj.year,
    genre: bookObj.genre,
    averageRating: bookObj.averageRating,
    
    // Liste des notations, sans les identifiants internes
    ratings: (bookObj.ratings || []).map(({ _id, ...rest }) => ({
      ...rest,
    })),

    // Étoiles calculées dynamiquement pour affichage frontend
    stars: generateStars(bookObj.averageRating, bookId),

    userId: bookObj.userId, // Créateur du livre
  };
};
