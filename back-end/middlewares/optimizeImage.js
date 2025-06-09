const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

module.exports = (req, res, next) => {
  // Si aucune image n’est attachée à la requête, on continue sans rien faire
  if (!req.file) return next();

  const { filename } = req.file;

  // Chemin du fichier original uploadé par multer
  const inputPath = path.join(__dirname, '../images', filename);

  // Nouveau nom et chemin pour l’image optimisée
  const optimizedFilename = 'optimized_' + filename;
  const outputPath = path.join(__dirname, '../images', optimizedFilename);

  // Traitement de l'image avec Sharp : redimensionnement + compression JPEG
  sharp(inputPath)
    .resize({
      width: 500,              // Largeur maximale
      withoutEnlargement: true // Ne pas agrandir les images plus petites
    })
    .jpeg({ quality: 70 })     // Compression à 70% (équilibre qualité/poids)
    .toFile(outputPath)
    .then(() => {
      // Supprime le fichier d’origine après optimisation
      fs.unlink(inputPath, (err) => {
        if (err) {
          console.error('Erreur lors de la suppression du fichier original :', err);
        }

        // Remplace le nom du fichier dans la requête par celui de l’image optimisée
        req.file.filename = optimizedFilename;

        next();
      });
    })
    .catch((err) => {
      // En cas d’erreur pendant le traitement sharp
      console.error('Erreur optimisation image :', err);
      res.status(500).json({
        error: "Erreur lors de l'optimisation de l'image"
      });
    });
};
