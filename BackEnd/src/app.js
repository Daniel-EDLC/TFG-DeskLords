require('dotenv').config();

// Inicializacion de express
const express = require('express');
const app = express();

// Importar los middlewares
const validarTokenJWT = require('./middlewares/validarTokenJWT');
const createResponseHelper = require('./middlewares/responseHelper');

const abilityRoutes = require('./routes/abilityRoutes');
const cardRoutes = require('./routes/cardRoutes');
const deckRoutes = require('./routes/deckRoutes');
const gameRoutes = require('./routes/gameRoutes');
const mapRoutes = require('./routes/mapRoutes');
const playerRoutes = require('./routes/playerRoutes');
const setRoutes = require('./routes/setRoutes');

app.use(express.json());

// Middleware que agrega el helper a cada request
app.use((req, res, next) => {
    req.response = createResponseHelper(res);
    next();
});

// Middleware para validar el token de autenticación
// app.use(validarTokenJWT);

// Usa las rutas agrupadas bajo /api
app.use('/api/abilities', abilityRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/maps', mapRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/sets', setRoutes);

module.exports = app;