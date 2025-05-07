const express = require('express');
const mongoose = require('mongoose');
const Ability = require('./models/Ability');
const Card = require('./models/Card');
const Deck = require('./models/Deck');
const Map = require('./models/Map');
const Player = require('./models/Player');
const Set = require('./models/Set');
require('dotenv').config();

const app = express();
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('Conectado a MongoDb Atlas correctamente'))
        .catch(err => console.error('Error al conectar a MongoDB: ', err));

function createResponseHelper(res) {
    return {
        success: (data = {}) => {
            return res.json({
                result: true,
                data: data,
                error: null
            });
        },
        error: (message = 'Error interno', statusCode = 400) => {
            return res.status(statusCode).json({
                result: false,
                data: null,
                error: message
            });
        }
    };
}

// Middleware que agrega el helper a cada request
app.use((req, res, next) => {
    req.response = createResponseHelper(res);
    next();
});

// Middleware que captura todas las peticiones
app.use((req, res) => {
    const path = req.path;

    switch (path) {
        case '/saludar':
            return saludar(req, res);
        case '/despedir':
            return despedir(req, res);
        case '/createPlayer':
            return createPlayer(req, res);
        default:
            return req.response.error('Ruta no encontrada', 404);
    }
});

function saludar(req, res) {
    return req.response.success({ mensaje: '¡Hola!' });
}

function despedir(req, res) {
    return req.response.success({ mensaje: '¡Adiós!' });
}

function operacionFallida(req, res) {
    // Uso del helper para respuestas de error
    return req.response.error('No se pudo completar la operación', 500);
}

async function createPlayer(req, res) {
    try {
        const newPlayer = new Player({
            id: req.body.id,
            name: req.body.name,
            state: req.body.state
        });
        
        const playerSaved = await newPlayer.save();
        
        // Usando tu formato de respuesta estándar
        req.response.success({ user: playerSaved });
      } catch (error) {
        req.response.error(`Error al crear usuario: ${error.message}`);
      }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`))