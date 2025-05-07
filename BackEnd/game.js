const express = require('express');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const Ability = require('./models/Ability');
const Card = require('./models/Card');
const Deck = require('./models/Deck');
const Map = require('./models/Map');
const Player = require('./models/Player');
const Set = require('./models/Set');
const Game = require('./models/Game');
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
        error: (message = 'Error interno') => {
            return res.json({
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
        case '/createCard':
            return createCard(req, res);
        case '/createDeck':
            return createDeck(req, res);
        case '/createPlayer':
            return createPlayer(req, res);
        case '/startGame':
            return startGame(req, res);
        case '/useCard':
            return useCard(req, res);
        case '/attack':
            return attack(req, res);
        case '/defend':
            return defend(req, res);
        case '/endTurn':
            return endTurn(req, res);
        default:
            return req.response.error('Ruta no encontrada', 404);
    }
});

// Ejemplo de funciones para manejar las rutas
// function saludar(req, res) {
//     return req.response.success({ mensaje: '¡Hola!' });
// }

// function despedir(req, res) {
//     return req.response.success({ mensaje: '¡Adiós!' });
// }

// function operacionFallida(req, res) {
//     // Uso del helper para respuestas de error
//     return req.response.error('No se pudo completar la operación');
// }

async function createCard(req, res) {
    try {
        const newCard = new Card({
            name: req.body.name,
            type: req.body.type,
            element: req.body.element,
            description: req.body.description,
            cost: req.body.manaCost,
            atk: req.body.attack,
            def: req.body.defense
        });
        
        const cardSaved = await newCard.save();
        
        // Usando tu formato de respuesta estándar
        req.response.success({ card: cardSaved });
      } catch (error) {
        req.response.error(`Error al crear la carta: ${error.message}`);
      }
}

async function createDeck(req, res) {
    try {
        const newDeck = new Deck({
            name: req.body.name,
            description: req.body.description,
            image: req.body.image,
            cards: req.body.cards
        });
        
        const deckSaved = await newDeck.save();
        
        // Usando tu formato de respuesta estándar
        req.response.success({ deck: deckSaved });
      } catch (error) {
        req.response.error(`Error al crear el mazo: ${error.message}`);
      }
}

async function createPlayer(req, res) {
    try {
        const id = new ObjectId(req.body.uid); // Genera un nuevo ObjectId para el jugador

        const newPlayer = new Player({
            _id: id,
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

async function startGame(req, res) {
    try {
        const { playerId } = req.body;

        const playerObjectId = new ObjectId(playerId);
        
        const player1 = await Player.findById(playerObjectId);
        const playerDeck = await Deck.findById(player1.owned_decks[0]);
        
        if (!player1) {
            return req.response.error('Uno o ambos jugadores no existen');
        }
        
        const newGame = new Game({
            status: 'in-progress',
            startTime: new Date(),
            playerId: playerId,
            currentTurn: 0,
            winner: null,
            playerCards: playerDeck.cards,
            // rivalDeck: [],
            mapId: 'mapa1',
            manaPerTurn: 1,
        });
        
        const gameSaved = await newGame.save();
        
        req.response.success({ gameId: gameSaved._id.toString(), game: gameSaved });
      } catch (error) {
        req.response.error(`Error al iniciar el juego: ${error.message}`);
      }
}

async function useCard(req, res) {
    try {
        const { gameId, cardId } = req.body;

        const gameObjectId = new ObjectId(gameId);
        
        const game = await Game.findById({_id: gameObjectId});
    } catch (error) {
        req.response.error(`Error al usar la carta: ${error.message}`);
    }
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`))