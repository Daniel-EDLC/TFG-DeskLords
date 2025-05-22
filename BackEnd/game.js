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

        switch (usedCard.type) {
            case 'criature':
                game.playerTable.push(usedCard);

                game.playerHand = game.playerHand.filter(card => card._id.toString() !== req.body.cardId);
                break;
            case 'equipement':
                game.playerTable.find(card => card._id.toString() === targetedCard._id.toString()).equipment = usedCard;

                game.playerHand = game.playerHand.filter(card => card._id.toString() !== req.body.cardId);
                break;
            case 'spell':
                switch (usedCard.effect) {
                    case 'protect_one':
                        targetedCard.temporaryAbilities = "invulnerable";
                        break;
                    case 'kill':
                        game.rivalTable = game.rivalTable.filter(card => card._id.toString() !== req.body.action.target.id);
                        game.rivalGraveyard.push(targetedCard);
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

// attack(): Gestiona la fase de ataque del jugador. Obtiene los atacantes, asigna defensores automáticamente usando chooseDefenders,
// y resuelve cada combate llamando a resolverCombate().
async function attack(req, res) {
    try {
        const gameObjectId = new ObjectId(req.body.gameId);
        const game = await Game.findById(gameObjectId);

        if (!game) {
            return req.response.error('Partida no encontrada');
        }

        const attackers = req.body.cards;
        const assignments = chooseDefenders(attackers, game.rivalTable);

        const combates = assignments.map(assignment =>
            resolverCombate({
                gameId: gameObjectId,
                attacker: assignment.attacker,
                defender: assignment.defender,
                isAI: false
            })
        );

        await Promise.all(combates);

        nextTurn({ game, isAi: true });

        placeCardsAndAttack()

        return req.response.success();
    } catch (error) {
        return req.response.error(`Error al atacar: ${error.message}`);
    }
}

// chooseDefenders(): Dada una lista de cartas atacantes y la mesa del rival,
// asigna automáticamente qué carta defensora (o el jugador) recibe cada ataque.
function chooseDefenders(attackingCards, rivalTable) {
    let availableDefenders = [...rivalTable];
    const assignments = [];

    for (const attacker of attackingCards) {
        const attackerAbilities = new Set(attacker.abilities || []);
        // Filtrar defensores válidos si el atacante vuela
        let validDefenders = availableDefenders.filter(defender => {
            if (attackerAbilities.has("volar")) {
                const defenderAbilities = new Set(defender.abilities || []);
                return defenderAbilities.has("volar");
            }
            return true;
        });

        // Si no hay defensores válidos, el ataque va directo al jugador
        if (validDefenders.length === 0) {
            assignments.push({ attacker, defender: "player" });
            continue;
        }

        // Prioridad: invulnerable (por ability o temporaryAbilities)
        let idxInvulnerable = validDefenders.findIndex(defender => {
            const abilities = new Set(defender.abilities || []);
            const tempAbilities = new Set(defender.temporaryAbilities || []);
            return abilities.has("invulnerable") || tempAbilities.has("invulnerable");
        });
        let bestDefenderIdx = 0;
        if (idxInvulnerable !== -1) {
            bestDefenderIdx = idxInvulnerable;
        } else {
            // Si no hay invulnerables, elegir el de más vida
            for (let i = 1; i < validDefenders.length; i++) {
                if ((validDefenders[i].hp || 0) > (validDefenders[bestDefenderIdx].hp || 0)) {
                    bestDefenderIdx = i;
                }
            }
        }
        const chosenDefender = validDefenders[bestDefenderIdx];
        assignments.push({ attacker, defender: chosenDefender });
        availableDefenders = availableDefenders.filter(d => d._id !== chosenDefender._id);
    }
    return assignments;
}

// resolverCombate(): Resuelve el combate entre una carta atacante y una defensora (o el jugador).
// Aplica el daño según habilidades (volar, invulnerable, toque mortal, fuerza bruta),
// actualiza la vida de las cartas y del jugador en la base de datos,
// y limpia las habilidades temporales al finalizar el combate.
async function resolverCombate({ gameId, attacker, defender, isAI }) {
    // Si el defensor es el jugador directamente
    if (defender === "player") {
        const hpField = isAI ? "playerHp" : "rivalHp";
        const dmg = attacker.atk;
        const gameDoc = await Game.findById(gameId);
        if (gameDoc) {
            let nuevaVida = Math.max(0, (gameDoc[hpField] || 0) - dmg);
            await Game.updateOne(
                { _id: gameId },
                { $set: { [hpField]: nuevaVida } }
            );
        }
        return;
    }

    // Comprobar si el atacante vuela y el defensor puede bloquearlo
    const attackerHabs = new Set(attacker.abilities || []);
    const defenderHabs = new Set(defender.abilities || []);
    const defenderTempHabs = new Set(defender.temporaryAbilities || []);

    if (attackerHabs.has("volar") && !defenderHabs.has("volar")) {
        // Si el atacante vuela y el defensor no, el daño va al jugador
        const hpField = isAI ? "playerHp" : "rivalHp";
        const dmg = attacker.atk;
        const gameDoc = await Game.findById(gameId);
        if (gameDoc) {
            let nuevaVida = Math.max(0, (gameDoc[hpField] || 0) - dmg);
            await Game.updateOne(
                { _id: gameId },
                { $set: { [hpField]: nuevaVida } }
            );
        }
        return;
    }

    // Comprobar invulnerabilidad en abilities o temporaryAbilities
    const defenderInvulnerable = defenderHabs.has("invulnerable") || defenderTempHabs.has("invulnerable");
    const attackerToqueMortal = attackerHabs.has("toque mortal");
    const attackerBruteForce = attackerHabs.has("brute force");

    const result = {
        attacker: { ...attacker },
        defender: { ...defender },
        dmgToPlayer: 0,
    };

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
        } else {
            result.attacker.hp -= defender.atk;
        }
    }

    // --- Fuerza Bruta
    if (attackerBruteForce && result.defender.hp <= 0 && !defenderInvulnerable) {
        const excess = attacker.atk - defender.hp;
        if (excess > 0) {
            result.dmgToPlayer = excess;
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

    // --- Si la carta sigue viva, actualizar hp en mesa y limpiar temporaryAbilities
    if (result.attacker.hp > 0) {
        await Game.updateOne(
            { _id: gameId, [`${attackerTable}._id`]: result.attacker._id },
            {
                $set: {
                    [`${attackerTable}.$.hp`]: result.attacker.hp,
                    [`${attackerTable}.$.temporaryAbilities`]: [],
                },
            }
        );
    } else {
        await Game.updateOne(
            { _id: gameId },
            {
                $pull: { [attackerTable]: { _id: result.attacker._id } },
                $push: { [attackerGraveyard]: result.attacker },
            }
        );
    }

    if (result.defender.hp > 0) {
        await Game.updateOne(
            { _id: gameId, [`${defenderTable}._id`]: result.defender._id },
            {
                $set: {
                    [`${defenderTable}.$.hp`]: result.defender.hp,
                    [`${defenderTable}.$.effect`]: result.defender.effect,
                    [`${defenderTable}.$.temporaryAbilities`]: [],
                },
            }
        );
    } else {
        await Game.updateOne(
            { _id: gameId },
            {
                $pull: { [defenderTable]: { _id: result.defender._id } },
                $push: { [defenderGraveyard]: result.defender },
            }
        );
    }
}

async function nextTurn({ game, isAi }) {

    if (!game) {
        throw new Error('Juego no encontrado');
    }

    const newTurn = game.currentTurn + 1;
    const newActualMana = game.manaPerTurn + game.actualMana;

    // Actualiza todos los campos relevantes en una sola operación
    await Game.updateOne(
        { _id: game._id },
        {
            $set: {
                currentTurn: newTurn,
                actualMana: newActualMana,
                playerMana: newActualMana,
                rivalMana: newActualMana
            }
        }
    );

    // Limpia temporaryAbilities de todas las cartas en mesa (jugador y rival)
    await Game.updateOne(
        { _id: game._id },
        {
            $set: {
                'playerTable.$[].temporaryAbilities': [],
                'rivalTable.$[].temporaryAbilities': []
            }
        }
    );

    // Robar una carta para el jugador o IA
    await drawCard({ game, isAI });
}

// drawCard(): Roba una carta del mazo pendiente y la añade a la mano del jugador o IA.
// Si el mazo está vacío, resta 1 de vida al jugador correspondiente.
async function drawCard({ game, isAI }) {
    // Determinar los campos a actualizar según si es IA o jugador
    const handField = isAI ? "rivalHand" : "playerHand";
    const pendingDeckField = isAI ? "rivalPendingDeck" : "playerPendingDeck";
    const hpField = isAI ? "rivalHp" : "playerHp";

    // Si el mazo pendiente está vacío, restar 1 de vida
    if (game[pendingDeckField].length === 0) {
        await Game.updateOne(
            { _id: game._id },
            { $inc: { [hpField]: -1 } }
        );
    } else {
        // Robar la primera carta del mazo pendiente
        const card = game[pendingDeckField][0];
        const newHand = [...game[handField], card];
        const newPendingDeck = game[pendingDeckField].slice(1);
        await Game.updateOne(
            { _id: game._id },
            {
                $set: {
                    [handField]: newHand,
                    [pendingDeckField]: newPendingDeck
                }
            }
        );
    }
}

// placeCardsAndAttack(): IA del rival para jugar cartas según prioridades y mana disponible.
async function placeCardsAndAttack(game) {

    let rivalHand = [...game.rivalHand];
    let rivalTable = [...game.rivalTable];
    let playerTable = [...game.playerTable];
    let playerGraveyard = [...game.playerGraveyard];
    let rivalMana = game.rivalMana;
    let cartasUsadas = [];
    let spellUsada = false;
    let equipementUsada = false;

    // 1. Spell
    const spellIdx = rivalHand.findIndex(c => c.type === 'spell' && c.cost <= rivalMana);
    if (spellIdx !== -1 && !spellUsada) {
        const spell = rivalHand[spellIdx];
        if (spell.effect === 'kill') {
            // Mata la carta de mayor coste de la mesa del jugador
            if (playerTable.length > 0) {
                const idx = playerTable.reduce((maxIdx, c, i, arr) => c.cost > arr[maxIdx].cost ? i : maxIdx, 0);
                playerGraveyard.push(playerTable[idx]);
                playerTable.splice(idx, 1);
                rivalMana -= spell.cost;
                cartasUsadas.push(spell._id);
                spellUsada = true;
            }
        } else if (spell.effect === 'protect') {
            // Protege la carta de la mesa del rival con menos vida
            if (rivalTable.length > 0) {
                const idx = rivalTable.reduce((minIdx, c, i, arr) => c.hp < arr[minIdx].hp ? i : minIdx, 0);
                if (!rivalTable[idx].temporaryAbilities) rivalTable[idx].temporaryAbilities = [];
                if (!rivalTable[idx].temporaryAbilities.includes('invulnerable')) {
                    rivalTable[idx].temporaryAbilities.push('invulnerable');
                }
                rivalMana -= spell.cost;
                cartasUsadas.push(spell._id);
                spellUsada = true;
            }
        }
    }

    // 2. Equipement
    const equipementIdx = rivalHand.findIndex(c => c.type === 'equipement' && c.cost <= rivalMana);
    if (equipementIdx !== -1 && !equipementUsada) {
        const equip = rivalHand[equipementIdx];
        if (rivalTable.length > 0) {
            if (equip.atk > equip.hp) {
                // Busca la carta con menos atk
                const idx = rivalTable.reduce((minIdx, c, i, arr) => c.atk < arr[minIdx].atk ? i : minIdx, 0);
                if (!rivalTable[idx].equipements) rivalTable[idx].equipements = [];
                rivalTable[idx].equipements.push(equip);
            } else {
                // Busca la carta con menos hp
                const idx = rivalTable.reduce((minIdx, c, i, arr) => c.hp < arr[minIdx].hp ? i : minIdx, 0);
                if (!rivalTable[idx].equipements) rivalTable[idx].equipements = [];
                rivalTable[idx].equipements.push(equip);
            }
            rivalMana -= equip.cost;
            cartasUsadas.push(equip._id);
            equipementUsada = true;
        }
    }

    // 3. Criature (todas las posibles según mana)
    let criatureHand = rivalHand.filter(c => c.type === 'criature' && c.cost <= rivalMana && !cartasUsadas.includes(c._id));
    // Calcula sumas
    const sumAtkPlayer = playerTable.reduce((acc, c) => acc + (c.atk || 0), 0);
    const sumHpPlayer = playerTable.reduce((acc, c) => acc + (c.hp || 0), 0);

    const sumAtkRival = rivalTable.reduce((acc, c) => acc + (c.atk || 0), 0);
    const sumHpRival = rivalTable.reduce((acc, c) => acc + (c.hp || 0), 0);

    while (criatureHand.length > 0 && rivalMana > 0) {
        let idx = -1;
        if (sumAtkPlayer > sumHpRival) {
            // Saca la carta con más vida
            idx = criatureHand.reduce((maxIdx, c, i, arr) => c.hp > arr[maxIdx].hp ? i : maxIdx, 0);
        } else if (sumHpPlayer > sumAtkRival) {
            // Saca la carta con más atk
            idx = criatureHand.reduce((maxIdx, c, i, arr) => c.atk > arr[maxIdx].atk ? i : maxIdx, 0);
        }
        if (idx !== -1 && criatureHand[idx].cost <= rivalMana) {
            rivalTable.push(criatureHand[idx]);
            rivalMana -= criatureHand[idx].cost;
            cartasUsadas.push(criatureHand[idx]._id);
            criatureHand.splice(idx, 1);
        } else {
            break;
        }
    }

    // Elimina las cartas usadas de la mano
    rivalHand = rivalHand.filter(c => !cartasUsadas.includes(c._id));

    // Actualiza el estado en la base de datos
    await Game.updateOne(
        { _id: game._id },
        {
            $set: {
                rivalHand,
                rivalTable,
                playerTable,
                playerGraveyard,
                rivalMana
            }
        }
    );

    // Ataca con todas las cartas de la mesa del rival
    return game.rivalTable;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`))