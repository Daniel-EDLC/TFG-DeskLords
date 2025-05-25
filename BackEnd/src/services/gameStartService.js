const { Types } = require('mongoose');
const Game = require('../models/Game');
const Player = require('../models/Player');
const Deck = require('../models/Deck');
const Map = require('../models/Map');

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
        const ObjectId = Types.ObjectId;
        const playerObjectId = new ObjectId(req.body.playerId);
        const deckObjectId = new ObjectId(req.body.user.deck.id);
        const mapObjectId = new ObjectId(req.body.map.id);

        const player = await Player.findById(playerObjectId);
        if (!player) {
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
            idPlayer: player._id,
            status: 'in-progress',
            startTime: new Date(),
            playerId: player._id,
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

        console.log(gameSaved.rivalHand)

        req.response.success({
            gameId: gameSaved._id.toString(),
            status: gameSaved.status,
            start_at: gameSaved.startTime,
            turn: {
                number: gameSaved.currentTurn,
                phase: "hand"
            },
            user: {
                hand: gameSaved.playerHand,
                table: [],
                pending_deck: gameSaved.playerPendingDeck,
                health: gameSaved.playerHp,
                mana: gameSaved.manaPerTurn
            },
            rival: {
                hand: gameSaved.rivalHand.length,
                table: [],
                pending_deck: gameSaved.rivalPendingDeck,
                health: gameSaved.rivalHp,
                mana: gameSaved.manaPerTurn
            }
        });
    } catch (error) {
        req.response.error(`Error al iniciar el juego: ${error.message}`);
    }
}

module.exports = { startGame };
