const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(express.json()); // Pour parser le JSON
app.use(cors()); // Pour gérer les CORS entre frontend et backend

// Exemple de route de test
app.get('/', (req, res) => {
  res.send('Bienvenue sur l’API Mon Vieux Grimoire !');
});

// Connexion à MongoDB (à compléter avec votre URI réelle)
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/grimoire', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Connexion à MongoDB réussie'))
  .catch((error) => console.error('❌ Échec de la connexion à MongoDB :', error));

// Démarrage du serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
});
