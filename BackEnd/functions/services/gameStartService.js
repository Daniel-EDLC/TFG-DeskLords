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
        const deckId = req.body.user.deck.id;
        const mapId = req.body.map.id;

        const player = await Player.findOne({ uid: req.body.playerId });
        if (!player) {
            return req.response.error('El jugador no existe');
        }

        const playerDeck = await Deck.findById(deckId);
        if (!playerDeck) {
            return req.response.error('El deck no existe');
        }

        const map = await Map.findById(mapId);
        if (!map) {
            return req.response.error('El mapa no existe');
        }

        // Barajar el mazo del jugador y del rival
        const playerDeckShuffled = shuffleCards(playerDeck.cards, 15);
        const rivalDeckShuffled = shuffleCards(map.deck.cards, 15);

        // Seleccionar la mano inicial del jugador: máximo 3 cartas, mínimo 2 creatures
        let playerStarterHand = [];
        let creatures = playerDeckShuffled.filter(card => card.type === 'creature');
        let nonCreatures = playerDeckShuffled.filter(card => card.type !== 'creature');

        // Añadir mínimo 2 creatures
        playerStarterHand = creatures.slice(0, 2);
        // Añadir hasta 1 carta más (de cualquier tipo)
        const remaining = playerDeckShuffled.filter(card => !playerStarterHand.includes(card));
        if (playerStarterHand.length < 3 && remaining.length > 0) {
            playerStarterHand.push(remaining[0]);
        }
        playerStarterHand = playerStarterHand.slice(0, 3);

        // El resto de cartas para el pending deck
        const playerPendingDeck = playerDeckShuffled.filter(card => !playerStarterHand.includes(card));

        const newGame = new Game({
            status: 'in-progress',
            startTime: new Date(),
            playerId: player.uid,
            playerDeck: playerDeck,
            playerHand: playerStarterHand,
            playerPendingDeck: playerPendingDeck,
            rivalDeck: map.deck,
            rivalHand: rivalDeckShuffled.slice(0, 3),
            rivalPendingDeck: rivalDeckShuffled.slice(3, 15),
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
                whose: "user",
                phase: "hand"
            },
            user: {
                hand: gameSaved.playerHand,
                table: [],
                pending_deck: gameSaved.playerPendingDeck.length,
                health: gameSaved.playerHp,
                mana: gameSaved.manaPerTurn
            },
            rival: {
                hand: gameSaved.rivalHand.length,
                table: [],
                pending_deck: gameSaved.rivalPendingDeck.length,
                health: gameSaved.rivalHp,
                mana: gameSaved.manaPerTurn
            }
        });
    } catch (error) {
        req.response.error(`Error al iniciar el juego: ${error.message}`);
    }
}

module.exports = { startGame };
