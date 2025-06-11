require('dotenv').config();

// Inicializacion de express
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const app = express();

// Importar los middlewares
// const validarTokenJWT = require('./middlewares/validarTokenJWT');
const createResponseHelper = require('./middlewares/responseHelper');

const cardRoutes = require('./routes/cardRoutes');
const deckRoutes = require('./routes/deckRoutes');
const gameRoutes = require('./routes/gameRoutes');
const mapRoutes = require('./routes/mapRoutes');
const playerRoutes = require('./routes/playerRoutes');
const setRoutes = require('./routes/setRoutes');
const newsRoutes = require('./routes/newsRoutes');
const commentsRoutes = require('./routes/commentsRoutes');
const battlePassRoutes = require('./routes/battlePassRoutes');
const avatarsRoutes = require('./routes/avatarsRoutes');
// const uploadRoutes = require('./routes/uploadRoutes');

// Conectar a la base de datos
app.use(connectDB);

// Middleware para permitir CORS
app.use(cors());

// Middleware que agrega el helper a cada request
app.use((req, res, next) => {
    req.response = createResponseHelper(res);
    next();
});

// Importar las rutas de subida de archivos
// app.use('/api', uploadRoutes);

// Middleware para parsear el cuerpo de las peticiones como JSON
app.use(express.json());

// Middleware para validar el token de autenticación
// app.use(validarTokenJWT);

// Usa las rutas agrupadas bajo /api
app.use('/api', cardRoutes);
app.use('/api', deckRoutes);
app.use('/api', gameRoutes);
app.use('/api', mapRoutes);
app.use('/api', playerRoutes);
app.use('/api', setRoutes);
app.use('/api', newsRoutes);
app.use('/api', commentsRoutes);
app.use('/api', battlePassRoutes);
app.use('/api', avatarsRoutes);

module.exports = app;