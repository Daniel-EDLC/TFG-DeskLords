const Player = require('../models/Player');
const Deck = require('../models/Deck');
const Map = require('../models/Map');
const News = require('../models/News');
const Avatars = require('../models/Avatars');

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

        const player = await Player.findOne({ uid: req.body.playerId });
        if (!player) {
            return req.response.error('Jugador no encontrado');
        }

        let allMaps = [];

        if (player.maps_unlocked.length > 0) {
            const unlockedMaps = await Promise.all(
                player.maps_unlocked.map(async mapId => {
                    const mapFound = await Map.findById(mapId);
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
                    const mapFound = await Map.findById(mapId);
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
                    const deckFound = await Deck.findById(deckId);
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
                    const deckFound = await Deck.findById(deckId);
                    return {
                        ...deckFound.toObject?.(),
                        available: false,
                    };
                })
            );

            allDecks = allDecks.concat(decks_locked);
        }

        let allAvatars = [];

        if (player.unlocked_avatars.length > 0) {
            const avatars_unlocked = await Promise.all(
                player.unlocked_avatars.map(async avatarId => {
                    const avatarFound = await Avatars.findById(avatarId);
                    return {
                        ...avatarFound.toObject?.(),
                        available: true,
                    };
                })
            );

            allAvatars = allAvatars.concat(avatars_unlocked);

        }

        if (player.locked_avatars.length > 0) {
            const avatars_locked = await Promise.all(
                player.locked_avatars.map(async avatarId => {
                    const avatarFound = await Avatars.findById(avatarId);
                    return {
                        ...avatarFound.toObject?.(),
                        available: false,
                    };
                })
            );

            allAvatars = allAvatars.concat(avatars_locked);

        }

        const avatarActive = await Avatars.findById(player.selected_avatar);
        const avatarUrl = avatarActive.url

        const newsFound = await News.find().sort({ fecha: -1 })

        const shopItems = {
            decks: allDecks.filter(deck => !deck.available || deck.belongsTo === 'shop'),
            avatars: allAvatars.filter(avatar => !avatar.available && avatar.belongsTo === 'shop'),
        }

        req.response.success({
            playerAvatar: avatarUrl || "no lo encuentra",
            playerName: player.displayName || 'Jugador Anónimo',
            playerLevel: player.player_level,
            playerExperience: player.player_level_progress,
            rol: player.rol,
            coins: player.coins || 0,
            decks: allDecks,
            maps: allMaps,
            news: newsFound || [],
            avatars: allAvatars,
            shop: shopItems
        })
    } catch (error) {
        req.response.error(`Error al obtener información del jugador: ${error.message}`);
    }
}

async function getPlayers(req, res) {
    try {
        const players = await Player.find().select('uid displayName player_level level_progress profile_img rol');
        req.response.success({ players: players });
    } catch (error) {
        req.response.error(`Error al obtener los jugadores: ${error.message}`);
    }
}

async function updatePlayer(req, res) {
    try {
        const playerId = req.body.idPlayer;
        const updatedData = req.body.data;

        const updatedPlayer = await Player.findByIdAndUpdate(playerId, updatedData, { new: true });
        if (!updatedPlayer) {
            return req.response.error('Jugador no encontrado');
        }

        req.response.success({ player: updatedPlayer });
    } catch (error) {
        req.response.error(`Error al actualizar el jugador: ${error.message}`);
    }
}

async function updatePlayerAvatar(req, res) {
    try {
        const playerId = req.body.idPlayer;
        const avatarId = req.body.avatarId;

        if (!playerId || !avatarId) {
            return req.response.error('Faltan datos obligatorios');
        }

        const player = await Player.findById(playerId);

        if (player.locked_avatars.includes(avatarId)) {
            return req.response.error('El avatar está bloqueado y no se puede seleccionar');
        }

        const updatedPlayer = await Player.findByIdAndUpdate(
            playerId,
            { selected_avatar: avatarId }
        );

        if (!updatedPlayer) {
            return req.response.error('Jugador no encontrado');
        }

        req.response.success({ player: updatedPlayer });
    } catch (error) {
        req.response.error(`Error al actualizar el avatar del jugador: ${error.message}`);
    }
}

async function deletePlayer(req, res) {
    try {
        const playerId = req.body.idPlayer;

        const deletedPlayer = await Player.findByIdAndDelete(playerId);
        if (!deletedPlayer) {
            return req.response.error('Jugador no encontrado');
        }

        req.response.success({ message: 'Jugador eliminado correctamente' });
    } catch (error) {
        req.response.error(`Error al eliminar el jugador: ${error.message}`);
    }
}

module.exports = {
    createPlayer,
    getPlayerInfo,
    checkPlayerExists,
    getPlayers,
    updatePlayer,
    deletePlayer,
    updatePlayerAvatar
};