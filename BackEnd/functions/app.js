require('dotenv').config();

// Inicializacion de express
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
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
const newsRoutes = require('./routes/newsRoutes');
const commentsRoutes = require('./routes/commentsRoutes');

app.use(express.json());
app.use(connectDB);
app.use(cors());

// Middleware que agrega el helper a cada request
app.use((req, res, next) => {
    req.response = createResponseHelper(res);
    next();
});

// Middleware para validar el token de autenticación
// app.use(validarTokenJWT);

// Usa las rutas agrupadas bajo /api
app.use('/api', abilityRoutes);
app.use('/api', cardRoutes);
app.use('/api', deckRoutes);
app.use('/api', gameRoutes);
app.use('/api', mapRoutes);
app.use('/api', playerRoutes);
app.use('/api', setRoutes);
app.use('/api', newsRoutes);
app.use('/api', commentsRoutes);

module.exports = app;