const Game = require('../models/Game');
const Player = require('../models/Player');
const Deck = require('../models/Deck');
const Map = require('../models/Map');
const Avatar = require('../models/Avatars');

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
        let playerDeckShuffled = [];

        try {
            playerDeckShuffled = shuffleCards(playerDeck.cards, 20);
        } catch (error) {
            return req.response.error(`Error al barajar el mazo del jugador: ${error.message}`);
        }

        let rivalDeckShuffled = [];
        try {
            rivalDeckShuffled = shuffleCards(map.deck.cards, 20);
        } catch (error) {
            return req.response.error(`Error al barajar el mazo del rival: ${error.message}`);
        }

        // Seleccionar la mano inicial del jugador: máximo 3 cartas, mínimo 2 creatures
        let playerStarterHand = [];
        let creatures = playerDeckShuffled.filter(card => card.type === 'creature');

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

        // Seleccionar la mano inicial del rival igual que la del jugador
        let rivalStarterHand = [];
        let rivalCreatures = rivalDeckShuffled.filter(card => card.type === 'creature');
        // Añadir mínimo 2 creatures
        rivalStarterHand = rivalCreatures.slice(0, 2);
        // Añadir hasta 1 carta más (de cualquier tipo)
        const rivalRemaining = rivalDeckShuffled.filter(card => !rivalStarterHand.includes(card));
        if (rivalStarterHand.length < 3 && rivalRemaining.length > 0) {
            rivalStarterHand.push(rivalRemaining[0]);
        }
        rivalStarterHand = rivalStarterHand.slice(0, 3);
        // El resto de cartas para el pending deck del rival
        const rivalPendingDeck = rivalDeckShuffled.filter(card => !rivalStarterHand.includes(card));

        const playerAvatar = await Avatar.findById(player.selected_avatar);

        const newGame = new Game({
            status: 'in-progress',
            startTime: new Date(),
            playerId: player.uid,
            playerDisplayName: player.displayName,
            playerAvatar: playerAvatar ? playerAvatar.url : 'default_avatar',
            playerDeck: playerDeck,
            playerHand: playerStarterHand,
            playerPendingDeck: playerPendingDeck,
            rivalAvatar: map.rivalAvatar,
            rivalDisplayName: map.rivalDisplayName,
            rivalDeck: map.deck,
            rivalHand: rivalStarterHand,
            rivalPendingDeck: rivalPendingDeck,
            mapId: map._id,
            mapBackgroundImage: map.backgroundImage || 'default_background',
        });

        const gameSaved = await newGame.save();

        req.response.success({
            gameId: gameSaved._id.toString(),
            status: gameSaved.status,
            start_at: gameSaved.startTime,
            backgroundImage: gameSaved.mapBackgroundImage,
            turn: {
                number: gameSaved.currentTurn,
                whose: "user",
                phase: "hand"
            },
            user: {
                playerAvatar: gameSaved.playerAvatar,
                playerDisplayName: gameSaved.playerDisplayName,
                hand: gameSaved.playerHand,
                table: [],
                pending_deck: gameSaved.playerPendingDeck.length,
                health: gameSaved.playerHp,
                mana: gameSaved.playerMana
            },
            rival: {
                rivalAvatar: gameSaved.rivalAvatar,
                rivalDisplayName: gameSaved.rivalDisplayName,
                hand: gameSaved.rivalHand.length,
                table: [],
                pending_deck: gameSaved.rivalPendingDeck.length,
                health: gameSaved.rivalHp,
                mana: gameSaved.rivalMana
            },
            action: 'welcome'
        });
    } catch (error) {
        req.response.error(`Error al iniciar el juego: ${error.message}`);
    }
}

async function surrender(req, res) {
    try {
        const playerId = req.body.playerId;
        if (!playerId) return req.response.error('El ID del jugador es requerido');

        const gameId = req.body.gameId;
        const game = await Game.findById(gameId);

        if (!game) return req.response.error('El juego no existe');

        if (game.playerId !== playerId) return req.response.error('No tienes permiso para rendirte en este juego');

        if (game.status !== 'in-progress') return req.response.error('El juego no está en progreso');

        await Game.updateOne(
            { _id: game._id },
            {
                $set: {
                    status: 'surrendered',
                    endTime: new Date(),
                    winner: "rival"
                }
            }
        );

        const gamefinished = await Game.findById(game._id);
        if (!gamefinished) return req.response.error('Error al actualizar el estado del juego');

        req.response.success({
            turn: {
                number: gamefinished.currentTurn,
                whose: "user",
                phase: "hand"
            },
            user: {
                hand: gamefinished.playerHand,
                table: gamefinished.playerTable,
                pending_deck: gamefinished.playerPendingDeck.length ? gamefinished.playerPendingDeck.length : 0,
                health: 0,
                mana: gamefinished.playerMana
            },
            rival: {
                hand: gamefinished.rivalHand.length ? gamefinished.rivalHand.length : 0,
                table: gamefinished.rivalTable,
                pending_deck: gamefinished.rivalPendingDeck.length ? gamefinished.rivalPendingDeck.length : 0,
                health: gamefinished.rivalHp,
                mana: gamefinished.rivalMana
            },
            gameId: gameId,
            gameOver: true,
            winner: gamefinished.winner,
            status: gamefinished.status,
            endTime: gamefinished.endTime
        });

    } catch (error) {
        req.response.error(`Error al rendirse: ${error.message}`);
    }
}

module.exports = { startGame, surrender };
