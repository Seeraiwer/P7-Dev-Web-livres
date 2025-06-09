// Import du module HTTP natif de Node.js
const http = require('http');

// Import de l'application Express configurée
const app = require('./app');

// Chargement des variables d'environnement
require('dotenv').config();

// Fonction utilitaire pour normaliser le port
const normalizePort = (val) => {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val; 
  if (port >= 0) return port; 
  return false;
};

// Définition du port
const port = normalizePort(process.env.PORT || 4000);
app.set('port', port);

// Création du serveur HTTP basé sur l'application Express
const server = http.createServer(app);

// Gestionnaire d'erreurs du serveur
const errorHandler = (error) => {
  console.trace('Trace errorHandler'); // Pour debug complet
  if (error.syscall !== 'listen') throw error;

  const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} nécessite des privilèges élevés.`);
      process.exit(1);
    case 'EADDRINUSE':
      console.error(`${bind} est déjà utilisé.`);
      process.exit(1);
    default:
      throw error;
  }
};

// Gestion des événements serveur
server.on('error', errorHandler);

// Démarrage du serveur
server.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
