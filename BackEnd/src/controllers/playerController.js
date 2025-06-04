const Player = require('../models/Player');
const Deck = require('../models/Deck');
const Map = require('../models/Map');
const Avatars = require('../models/Avatars');
const { Types } = require('mongoose');

async function createPlayer(req, res) {
    try {

        const existingPlayer = await Player.findOne({ uid: req.body.uid });
        if (existingPlayer) {
            return req.response.error("El usuario ya existe");
        }

        const defaultAvatar = await Avatars.findOne({ name: 'default' });
        const lockedAvatars = await Avatars.find();

        const lockedAvatarsFiltered = lockedAvatars.filter(avatar => avatar.name !== 'default');
        
        const newPlayer = new Player({
            uid: req.body.uid,
            name: req.body.name,
            surname: req.body.surnames,
            displayName: req.body.displayName,
            owned_decks: [
                "68389e882a7841f9396d8e9b",
            ],
            locked_decks: [
                "68389e292a7841f9396d8e7b",
                "68389ef02a7841f9396d8ebb"
            ],
            maps_unlocked: [
                "6838a2bc36599377ad700412",
            ],
            maps_locked: [
                "6838a30436599377ad700434",
            ],
            selected_avatar: defaultAvatar._id,
            locked_avatars: lockedAvatarsFiltered.map(avatar => avatar._id),
        });

        const playerSaved = await newPlayer.save();

        // Usando tu formato de respuesta estándar
        req.response.success({ user: playerSaved });
    } catch (error) {
        req.response.error(`Error al crear usuario: ${error.message}`);
    }
}

async function checkPlayerExists(req, res) {
    try {

        const playerExists = await Player.exists({ uid: req.body.idPlayer });

        if (playerExists) {
            req.response.success({ exists: true });
        } else {
            req.response.error("Usuario no encontrado");
        }
    } catch (error) {
        req.response.error(`Error al verificar la existencia del jugador: ${error.message}`);
    }
}

async function getPlayerInfo(req, res) {
    try {
        const ObjectId = Types.ObjectId;

        const player = await Player.findOne({ uid: req.body.playerId });
        if (!player) {
            return req.response.error('Jugador no encontrado');
        }

        let allMaps = [];

        if (player.maps_unlocked.length > 0) {
            const unlockedMaps = await Promise.all(
                player.maps_unlocked.map(async mapId => {
                    const mapObjectId = new ObjectId(mapId);
                    const mapFound = await Map.findById(mapObjectId);
                    return {
                        name: mapFound.name,
                        id: mapFound._id,
                        image: mapFound.image,
                        available: true,
                    };
                })
            );

            allMaps = allMaps.concat(unlockedMaps);
        }

        if (player.maps_locked.length > 0) {
            const lockedMaps = await Promise.all(
                player.maps_locked.map(async mapId => {
                    const mapObjectId = new ObjectId(mapId);
                    const mapFound = await Map.findById(mapObjectId);
                    return {
                        name: mapFound.name,
                        id: mapFound._id,
                        image: mapFound.image,
                        available: false,
                    };
                })
            );

            allMaps = allMaps.concat(lockedMaps);
        }

        let allDecks = [];

        // Obtener los objetos completos de los decks
        if (player.owned_decks.length > 0) {
            const decks_unlocked = await Promise.all(
                player.owned_decks.map(async deckId => {
                    const deckObjectId = new ObjectId(deckId);
                    const deckFound = await Deck.findById(deckObjectId);
                    return {
                        ...deckFound.toObject?.(),
                        available: true,
                    };
                })
            );

            allDecks = allDecks.concat(decks_unlocked);
        }

        if (player.locked_decks.length > 0) {
            const decks_locked = await Promise.all(
                player.locked_decks.map(async deckId => {
                    const deckObjectId = new ObjectId(deckId);
                    const deckFound = await Deck.findById(deckObjectId);
                    return {
                        ...deckFound.toObject?.(),
                        available: false,
                    };
                })
            );

            allDecks = allDecks.concat(decks_locked);
        }

        req.response.success({
            playerAvatar: player.profile_img || 'https://example.com/default-avatar.png',
            playerName: player.displayName || 'Jugador Anónimo',
            playerLevel: player.player_level,
            playerExperience: player.level_progress || 2445456,
            rol: player.rol,
            decks: allDecks,
            maps: allMaps,
        })
    } catch (error) {
        req.response.error(`Error al obtener información del jugador: ${error.message}`);
    }
}

module.exports = {
    createPlayer,
    getPlayerInfo,
    checkPlayerExists
};