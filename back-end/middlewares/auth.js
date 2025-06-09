const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // Récupération de l'en-tête Authorization de la requête
    const authorization = req.headers.authorization;

    // Vérifie la présence et le format du header (doit commencer par "Bearer ")
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(400).json({ error: 'Token mal formé' });
    }

    // Extraction du token JWT depuis l'en-tête
    const token = authorization.split(' ')[1]; // Extrait le token après "Bearer"

    // Vérifie et décode le token à l’aide de la clé secrète
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);

    // Ajoute l’ID utilisateur décodé dans l’objet req pour l’utiliser dans les routes
    req.auth = { userId: decodedToken.userId };

    // Passage au middleware ou contrôleur suivant
    next();
  } catch (error) {
    // En cas d’erreur : token invalide, expiré, inexistant, etc.
    console.error("Erreur d'authentification :", error.message);
    res.status(401).json({ error: 'Requête non authentifiée' });
  }
};
