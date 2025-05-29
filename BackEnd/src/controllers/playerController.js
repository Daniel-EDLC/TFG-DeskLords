const Player = require('../models/Player');
const Deck = require('../models/Deck');
const Map = require('../models/Map');
const { Types } = require('mongoose');

async function createPlayer(req, res) {
    try {
        const ObjectId = Types.ObjectId;
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

async function getPlayerInfo(req, res) {
    try {
        const ObjectId = Types.ObjectId;
        const playerId = req.body.playerId;
        const playerObjectId = new ObjectId(playerId);

        const player = await Player.findById(playerObjectId);
        if (!player) {
            return req.response.error('Jugador no encontrado');
        }

        let allMaps = [];

        if (player.maps_unlocked.length > 0) {
            allMaps = await Promise.all(
                player.maps_unlocked.map(async mapId => {
                    const mapFound = await Map.findById(mapId);
                    return {
                        nombre: mapFound.name,
                        id: mapFound._id,
                        image: mapFound.image,
                        available: true,
                    };
                })
            );
        }

        if (player.maps_locked.length > 0) {
            allMaps = await Promise.all(
                player.maps_locked.map(async mapId => {
                    const mapObjectId = new ObjectId(mapId);
                    const mapFound = await Map.findById(mapObjectId);
                    return {
                        nombre: mapFound.name,
                        id: mapFound._id,
                        image: mapFound.image,
                        available: false,
                    };
                })
            );
        }

        // Obtener los objetos completos de los decks
        const mazos = await Promise.all(
            player.owned_decks.map(async deckId => {
                const deckObjectId = new ObjectId(deckId);
                const deckFound = await Deck.findById(deckObjectId);
                return deckFound;
            })
        );

        req.response.success({
            playerAvatar: player.profile_img || 'https://example.com/default-avatar.png',
            playerName: player.displayName || 'Jugador Anónimo',
            playerLevel: player.player_level,
            playerExperience: player.level_progress || 2445456,
            rol: player.rol,
            decks: mazos,
            mapas: allMaps,
        })
    } catch (error) {
        req.response.error(`Error al obtener información del jugador: ${error.message}`);
    }
}

module.exports = {
    createPlayer,
    getPlayerInfo
};