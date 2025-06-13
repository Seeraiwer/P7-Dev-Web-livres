// -----------------------------------------------------------------------------
// Fonction utilitaire : génère un tableau d’étoiles à partir d’une note moyenne
// Utilisé pour le rendu visuel (ex. : notation en étoiles dans le frontend)
// -----------------------------------------------------------------------------
const generateStars = (averageRating, bookId) => {
  const full = Math.floor(averageRating); // Nombre d’étoiles pleines (entier inférieur)
  const empty = 5 - full;                 // Nombre d’étoiles vides à compléter jusqu’à 5

  // Construit un tableau contenant des objets représentant chaque étoile
  return [
    ...Array.from({ length: full }, (_, i) => ({
      type: 'full',
      id: `${bookId}-full-${i}`, // ID unique basé sur le livre et l’index
    })),
    ...Array.from({ length: empty }, (_, i) => ({
      type: 'empty',
      id: `${bookId}-empty-${i}`, // ID unique pour les étoiles vides
    })),
  ];
};

// -----------------------------------------------------------------------------
// Fonction principale : formatBook()
// Convertit un document MongoDB "Book" en un objet prêt à être envoyé au frontend
// -----------------------------------------------------------------------------
module.exports = (book) => {
  // Conversion en objet JS brut si on reçoit un document Mongoose
  const bookObj = book.toObject?.() || book;

  // Génère un identifiant unique de secours si l’ID n’est pas disponible
  const bookId =
    bookObj._id?.toString?.() || bookObj.id || `fallback-${Date.now()}-${Math.random()}`;

  return {
    _id: bookObj._id,             // Identifiant MongoDB
    title: bookObj.title,         // Titre du livre
    author: bookObj.author,       // Nom de l’auteur
    imageUrl: bookObj.imageUrl,   // URL de l’image de couverture
    year: bookObj.year,           // Année de publication
    genre: bookObj.genre,         // Genre littéraire
    averageRating: bookObj.averageRating, // Note moyenne calculée

    // Nettoyage du tableau de notations : suppression de l’attribut interne _id
    ratings: (bookObj.ratings || []).map(({ _id, ...rest }) => ({
      ...rest,
    })),

    // Génération du tableau d’étoiles pour l’affichage graphique
    stars: generateStars(bookObj.averageRating, bookId),

    userId: bookObj.userId, // Référence au créateur du livre
  };
};
