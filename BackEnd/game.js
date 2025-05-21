require('dotenv').config();

// Inicializacion de express
const express = require('express');
const app = express();
app.use(express.json());

// Inicializacion de mongoose
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Conectado a MongoDb Atlas correctamente'))
    .catch(err => console.error('Error al conectar a MongoDB: ', err));

// Importar el middleware de validación de token
const validarTokenJWT = require('./middlewares/validarTokenJWT');

const Ability = require('./models/Ability');
const Card = require('./models/Card');
const Deck = require('./models/Deck');
const Map = require('./models/Map');
const Player = require('./models/Player');
const Set = require('./models/Set');
const Game = require('./models/Game');

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

// Middleware para validar el token de autenticación
// app.use(validarTokenJWT);

// Middleware que captura todas las peticiones
app.use((req, res) => {
    const path = req.path;

    switch (path) {
        case '/createAbility':
            return createAbility(req, res);
        case '/createCard':
            return createCard(req, res);
        case '/createDeck':
            return createDeck(req, res);
        case '/createSet':
            return createSet(req, res);
        case '/createMap':
            return createMap(req, res);
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

// --------------------------------------------------------------------------- FUNCIONES DE CREACION DE DOCUMENTOS

async function createAbility(req, res) {
    try {
        const newAbility = new Ability({
            name: req.body.name,
            description: req.body.description,
        });

        const abilitySaved = await newAbility.save();

        req.response.success({ ability: abilitySaved });
    } catch (error) {
        req.response.error(`Error al crear la habilidad: ${error.message}`);
    }
}

async function createSet(req, res) {
    try {
        const newSet = new Set({
            name: req.body.name,
            description: req.body.description,
            release_date: req.body.release_date
        });

        const setSaved = await newSet.save();

        // Usando tu formato de respuesta estándar
        req.response.success({ set: setSaved });
    } catch (error) {
        req.response.error(`Error al crear el set: ${error.message}`);
    }
}

async function createMap(req, res) {
    try {
        const newMap = new Map({
            name: req.body.name,
            description: req.body.description,
            image: req.body.image,
            deck: req.body.deck,
            element: req.body.element
        });

        const mapSaved = await newMap.save();

        // Usando tu formato de respuesta estándar
        req.response.success({ map: mapSaved });
    } catch (error) {
        req.response.error(`Error al crear el mapa: ${error.message}`);
    }
}



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

// --------------------------------------------------------------------------- FUNCIONES DEL DESARROLLO DE UNA PARTIDA

function shuffleCards(array, size) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, size);
}

async function startGame(req, res) {
    try {
        const playerObjectId = new ObjectId(req.body.playerId);
        const deckObjectId = new ObjectId(req.body.user.deck.id);
        const mapObjectId = new ObjectId(req.body.map.id);

        const player1 = await Player.findById({ playerObjectId });
        if (!player1) {
            return req.response.error('El jugador no existe');
        }

        const playerDeck = await Deck.findById(deckObjectId);
        if (!playerDeck) {
            return req.response.error('El deck no existe');
        }

        const map = await Map.findById(mapObjectId);
        if (!map) {
            return req.response.error('El mapa no existe');
        }

        const playerDeckShuffled = shuffleCards(playerDeck.cards, 10);
        const rivalDeckShuffled = shuffleCards(map.deck.cards, 10);

        const newGame = new Game({
            status: 'in-progress',
            startTime: new Date(),
            playerId: player1._id,
            playerDeck: playerDeck,
            playerHand: playerDeckShuffled.slice(0, 5),
            playerPendingDeck: playerDeckShuffled.slice(5, 10),
            rivalDeck: map.deck,
            rivalHand: rivalDeckShuffled.slice(0, 5),
            rivalPendingDeck: rivalDeckShuffled.slice(5, 10),
            mapId: map._id,
            manaPerTurn: 1,
        });

        const gameSaved = await newGame.save();

        req.response.success({
            gameId: gameSaved._id.toString(),
            status: gameSaved.status,
            start_at: gameSaved.startTime,
            turn: {
                number: gameSaved.currentTurn,
                phase: "hand"
            },
            "user": {
                "hand": gameSaved.playerHand,
                "table": [],
                "pending_deck": gameSaved.playerPendingDeck,
                "health": gameSaved.playerHp,
                "mana": gameSaved.manaPerTurn
            },
            "rival": {
                "hand": gameSaved.rivalHand,
                "table": [],
                "pending_deck": gameSaved.rivalPendingDeck,
                "health": gameSaved.rivalHp,
                "mana": gameSaved.manaPerTurn
            }
        });
    } catch (error) {
        req.response.error(`Error al iniciar el juego: ${error.message}`);
    }
}

async function useCard(req, res) {
    try {
        const gameObjectId = new ObjectId(req.body.gameId);

        const game = await Game.findById(gameObjectId);

        // Encuentra la carta en la mano del jugador
        const usedCard = game.playerHand.find(card => card._id.toString() == req.body.cardId);

        // Encuentra la carta objetivo en la mesa del jugador o de la IA
        const targetedCard = game.playerTable.find(card => card._id.toString() == req.body.action.target.id) || game.rivalTable.find(card => card._id.toString() === req.body.action.target.id)

        // Verifica que la carta exista
        if (!usedCard) {
            return req.response.error("Carta no encontrada en la mano del jugador");
        }

        if (!targetedCard) {
            return req.response.error("Carta no encontrada en la mesa del jugador o del rival");
        }

        switch (usedCard.type) {
            case 'criature':
                game.playerTable.push(usedCard);

                game.playerHand = game.playerHand.filter(card => card._id.toString() !== req.body.cardId);
                break;
            case 'equipement':

                game.playerHand = game.playerHand.filter(card => card._id.toString() !== req.body.cardId);
                break;
            case 'spell':
                switch (usedCard.effect) {
                    case 'protect_one':
                        targetedCard.positiveEffect = "protected";
                        break;
                    case 'protect_all':
                        game.playerTable.forEach(card => {
                            card.positiveEffect = "protected";
                        })
                        break;
                    case 'kill':
                        targetedCard.negativeEffect.push("kill");
                        break;
                }

                game.playerGraveyard = game.playerHand.find(card => card._id.toString() == req.body.cardId);
                game.playerHand = game.playerHand.filter(card => card._id.toString() !== req.body.cardId);
                break;
        }

        game.playerMana = game.playerMana - usedCard.cost;

        // Guarda los cambios
        const gameSaved = await game.save();

        //FALTA CONSTRUIR LA RESPUESTA ------------------------------------------------------------------------------------------------------
        return req.response.success();
    } catch (error) {
        return req.response.error(`Error al usar la carta: ${error.message}`);
    }
}

async function attack(req, res) {
    try {



    } catch (error) {
        req.response.error(`Error al atacar: ${error.message}`);
    }
}

//FALTA VER SI PUEDO QUITAR LA RESPUESTA Y HACER QUE SE GUARDE TODO EN EL GAME DIRECTAMENTE -------------------------------------------------------------------------------
async function resolverCombate({ gameId, attacker, defender, isAI }) {
    const result = {
        attacker: { ...attacker },
        defender: { ...defender },
        dañoAlJugador: 0,
    };

    const attackerHabs = new Set(attacker.abilities || []);
    const defenderHabs = new Set(defender.abilities || []);

    const attackerInvulnerable = attackerHabs.has("invulnerable");
    const defenderInvulnerable = defenderHabs.has("invulnerable");
    const attackerToqueMortal = attackerHabs.has("toque mortal");
    const defenderToqueMortal = defenderHabs.has("toque mortal");

    // --- Daño al defender
    if (!defenderInvulnerable) {
        if (attackerToqueMortal) {
            result.defender.hp = 0;
        } else {
            result.defender.hp -= attacker.atk;
        }
    }

    // --- Daño al attacker
    if (!attackerInvulnerable) {
        if (defenderToqueMortal) {
            result.attacker.hp = 0;
        }
    }

    // --- Sangrado
    if (attackerHabs.has("bleeding") && result.defender.hp > 0) {
        result.defender.effect = "bleeding";
    } else {
        result.defender.effect = null;
    }

    // --- Fuerza Bruta
    if (attackerHabs.has("brute force") && result.defender.hp <= 0 && !defenderInvulnerable) {
        const exceso = attacker.atk - defender.hp;
        if (exceso > 0) {
            result.dañoAlJugador = exceso;
        }
    }

    // --- Limitar hp mínimo 0
    result.attacker.hp = Math.max(0, result.attacker.hp);
    result.defender.hp = Math.max(0, result.defender.hp);

    // --- Actualización en BD
    const attackerTable = isAI ? "rivalTable" : "playerTable";
    const defenderTable = isAI ? "playerTable" : "rivalTable";
    const attackerGraveyard = isAI ? "rivalGraveyard" : "playerGraveyard";
    const defenderGraveyard = isAI ? "playerGraveyard" : "rivalGraveyard";

    // --- Si la carta sigue viva, actualizar hp/effect en mesa
    if (result.attacker.hp > 0) {
        await Game.updateOne(
            { _id: gameId, [`${attackerTable}._id`]: result.attacker._id },
            {
                $set: {
                    [`${attackerTable}.$.hp`]: result.attacker.hp,
                },
            }
        );
    } else {
        // mover al cementerio
        await Game.updateOne(
            { _id: gameId },
            {
                $pull: { [attackerTable]: { _id: result.attacker._id } },
                $push: { [attackerGraveyard]: result.attacker },
            }
        );
    }

    // --- Si la carta sigue viva, actualizar hp/effect en mesa
    if (result.defender.hp > 0) {
        await Game.updateOne(
            { _id: gameId, [`${defenderTable}._id`]: result.defender._id },
            {
                $set: {
                    [`${defenderTable}.$.hp`]: result.defender.hp,
                    [`${defenderTable}.$.effect`]: result.defender.effect,
                },
            }
        );
    } else {
        // mover al cementerio
        await Game.updateOne(
            { _id: gameId },
            {
                $pull: { [defenderTable]: { _id: result.defender._id } },
                $push: { [defenderGraveyard]: result.defender },
            }
        );
    }

    return result;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`))