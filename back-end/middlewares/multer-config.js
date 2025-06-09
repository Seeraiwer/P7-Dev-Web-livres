const multer = require('multer');
const path = require('path');

// Définition des types MIME autorisés pour l'upload d'image
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

// Configuration du stockage avec multer
const storage = multer.diskStorage({
  // Répertoire de destination des fichiers uploadés
  destination: (req, file, callback) => {
    callback(null, 'images'); // Les fichiers seront stockés dans le dossier 'images'
  },

  // Nom du fichier généré
  filename: (req, file, callback) => {
    // Nettoyage du nom original pour éviter les espaces et extensions multiples
const name = file.originalname
  .split(' ')
  .join('_')
  .normalize('NFD') // décompose les lettres accentuées
  .replace(/[\u0300-\u036f]/g, '') // supprime les diacritiques
  .replace(/[^a-zA-Z0-9_-]/g, ''); // garde uniquement les caractères sûrs

const extension = MIME_TYPES[file.mimetype];
    
    // Génération d’un nom unique avec horodatage
    const finalName = `${name}_${Date.now()}.${extension}`;
    callback(null, finalName);
  },
});

// Filtrage des fichiers : n'accepte que les types MIME déclarés
const fileFilter = (req, file, callback) => {
  if (MIME_TYPES[file.mimetype]) {
    callback(null, true); // Fichier accepté
  } else {
    // Ajout d'une erreur personnalisée accessible dans la route
    req.fileValidationError = 'Format de fichier non autorisé';
    callback(null, false); // Fichier rejeté
  }
};

// Middleware complet multer avec taille limite et filtrage
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite à 10 Mo
  },
  fileFilter,
}).single('image'); // Attend un champ nommé 'image'

module.exports = upload;
