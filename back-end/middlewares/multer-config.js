const multer = require('multer');
const path = require('path');

// -----------------------------------------------------------------------------
// Définition des types MIME autorisés pour l’upload d’images
// -----------------------------------------------------------------------------
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

// -----------------------------------------------------------------------------
// Configuration du stockage disque avec multer
// -----------------------------------------------------------------------------
const storage = multer.diskStorage({
  // Dossier de destination des fichiers uploadés
  destination: (req, file, callback) => {
    callback(null, 'images'); // Tous les fichiers sont stockés dans le dossier /images
  },

  // Nom du fichier à enregistrer
  filename: (req, file, callback) => {
    // Nettoyage du nom original :
    // - remplace les espaces par des underscores
    // - supprime les accents
    // - retire les caractères spéciaux non sûrs
    const name = file.originalname
      .split(' ')
      .join('_')
      .normalize('NFD')                       // Décomposition des accents (é => e + ́)
      .replace(/[\u0300-\u036f]/g, '')        // Suppression des diacritiques
      .replace(/[^a-zA-Z0-9_-]/g, '');        // Garde uniquement lettres, chiffres, _ et -

    // Récupère l’extension à partir du type MIME
    const extension = MIME_TYPES[file.mimetype];

    // Génère un nom de fichier unique avec un timestamp
    const finalName = `${name}_${Date.now()}.${extension}`;
    callback(null, finalName);
  },
});

// -----------------------------------------------------------------------------
// Filtrage des fichiers par leur type MIME (pour éviter les fichiers malicieux)
// -----------------------------------------------------------------------------
const fileFilter = (req, file, callback) => {
  if (MIME_TYPES[file.mimetype]) {
    callback(null, true); // Fichier autorisé
  } else {
    // On ajoute un indicateur d’erreur personnalisé pour l’exploiter dans les routes
    req.fileValidationError = 'Format de fichier non autorisé';
    callback(null, false); // Fichier refusé silencieusement
  }
};

// -----------------------------------------------------------------------------
// Configuration complète du middleware multer
// - Stockage : disque local
// - Taille max : 10 Mo
// - Type MIME : image uniquement
// -----------------------------------------------------------------------------
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // Limite de taille à 10 Mo par fichier
  },
  fileFilter,
}).single('image'); // Le champ attendu dans la requête multipart/form-data est "image"

module.exports = upload;
