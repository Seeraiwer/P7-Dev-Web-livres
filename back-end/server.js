// Importation du module HTTP natif de Node.js pour créer un serveur HTTP bas niveau
const http = require('http');

// Importation de l'application Express définie dans le fichier 'app.js'
const app = require('./app');

// Chargement des variables d'environnement depuis un fichier .env
require('dotenv').config();

// Fonction utilitaire permettant de normaliser le port (gère chaînes et entiers)
const normalizePort = (val) => {
  const port = parseInt(val, 10); // Tente de convertir la valeur en entier
  if (isNaN(port)) return val;    // Si ce n'est pas un nombre, retourne la valeur brute
  if (port >= 0) return port;     // Si c'est un entier positif, retourne-le
  return false;                   // Sinon, retourne false pour signaler une erreur
};

// Détermination du port d'écoute à partir de la variable d'environnement ou par défaut 4000
const port = normalizePort(process.env.PORT || 4000);
app.set('port', port); // Enregistrement du port dans l'application Express

// Création d'un serveur HTTP en utilisant l'application Express comme gestionnaire de requêtes
const server = http.createServer(app);

// Fonction de gestion des erreurs survenues lors du lancement du serveur
const errorHandler = (error) => {
  console.trace('Trace errorHandler'); // Affiche une trace pour faciliter le débogage

  if (error.syscall !== 'listen') throw error; // Ignore les erreurs qui ne concernent pas 'listen'

  // Détermine si le port est un pipe nommé ou un port numérique
  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  // Gère les erreurs courantes lors du lancement du serveur
  switch (error.code) {
    case 'EACCES': // Privilèges insuffisants pour écouter sur le port
      console.error(`${bind} nécessite des privilèges élevés.`);
      process.exit(1); // Quitte le processus avec une erreur
    case 'EADDRINUSE': // Le port est déjà utilisé par un autre processus
      console.error(`${bind} est déjà utilisé.`);
      process.exit(1); // Quitte le processus avec une erreur
    default:
      throw error; // Relance l’erreur pour un traitement ultérieur
  }
};

// Enregistrement du gestionnaire d’erreurs sur l’événement 'error' du serveur
server.on('error', errorHandler);

// Démarrage du serveur HTTP sur le port défini et affichage d’un message de confirmation
server.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
