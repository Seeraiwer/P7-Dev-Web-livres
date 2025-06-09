// Configuration de base de l'API : à centraliser dans un fichier .env pour plus de flexibilité
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

/**
 * Routes utilisées pour communiquer avec l'API backend.
 */
export const API_ROUTES = {
  SIGN_UP: `${API_URL}/api/auth/signup`, // Route d'inscription
  SIGN_IN: `${API_URL}/api/auth/login`, // Route de connexion
  BOOKS: `${API_URL}/api/books`, // Liste ou ajout de livres
  BEST_RATED: `${API_URL}/api/books/bestrating`, // Récupération des livres les mieux notés
};

/**
 * Routes internes de navigation dans l'application frontend.
 * À utiliser avec React Router ou tout autre système de routage.
 */
export const APP_ROUTES = {
  SIGN_UP: '/inscription', // Page d'inscription
  SIGN_IN: '/connexion', // Page de connexion
  ADD_BOOK: '/ajouter', // Page pour ajouter un livre
  BOOK: '/livre/:id', // Détail d'un livre
  UPDATE_BOOK: '/livre/modifier/:id', // Page de modification d’un livre
};
