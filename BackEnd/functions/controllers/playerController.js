const Player = require('../models/Player');
const Deck = require('../models/Deck');
const News = require('../models/News');
const Avatars = require('../models/Avatars');
const { getMapsAvailable, getAvatarsAvailable, getDecksAvailable } = require('../utils/playerUtils');
const { getBattlePassPlayer } = require('../utils/battlePassUtils');
const { createBattlePass } = require('../controllers/battlePassController');

async function createPlayer(req, res) {
    try {

        const existingPlayer = await Player.findOne({ uid: req.body.uid });
        if (existingPlayer) {
            return req.response.error("El usuario ya existe");
        }

        const defaultAvatar = await Avatars.findOne({ name: 'default' });
        const lockedAvatars = await Avatars.find();

        const lockedAvatarsFiltered = lockedAvatars.filter(avatar => avatar.name !== 'default');

        const battlePassCreated = await createBattlePass(req.body.uid);
        if (battlePassCreated.error) {
            return req.response.error(`Error al crear el pase de batalla: ${battlePassCreated.error}`);
        }

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

        const allMaps = await getMapsAvailable(player);

        const allDecks = await getDecksAvailable(player);

        const allAvatars = await getAvatarsAvailable(player);

        const avatarActive = await Avatars.findById(player.selected_avatar);
        const avatarUrl = avatarActive.url

        const newsFound = await News.find().sort({ fecha: -1 })

        const shopItems = {
            decks: allDecks.filter(deck => !deck.available || deck.belongsTo === 'shop'),
            avatars: allAvatars.filter(avatar => !avatar.available && avatar.belongsTo === 'shop'),
        }

        const battlePass = await getBattlePassPlayer(player.uid);

        const playerXp = player.player_level_progress;

        let tutorial = false;
        if (playerXp == 0 && player.player_level == 0) {
            tutorial = true;
            await Player.updateOne(
                { uid: player.uid },
                { $inc: { player_level_progress: 1 } }
            );
        }

        const defualtDeck = await Deck.findById(player.owned_decks[0]);

        const defaultDeckImage = defualtDeck.image;

        req.response.success({
            playerAvatar: avatarUrl || "no lo encuentra",
            playerName: player.displayName || 'Jugador Anónimo',
            playerLevel: player.player_level,
            playerExperience: player.player_level_progress,
            rol: player.rol,
            coins: player.coins || 0,
            decks: allDecks || [],
            maps: allMaps || [],
            news: newsFound || [],
            avatars: allAvatars || [],
            shop: shopItems || [],
            battlePass: battlePass || {},
            tutorial: { mode: tutorial, defaultDeckImage: defaultDeckImage }
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
        const playerId = req.body.playerId;
        const avatarId = req.body.avatarId;

        if (!playerId || !avatarId) {
            return req.response.error('Faltan datos obligatorios');
        }

        const player = await Player.findById(playerId);

        if (!player) return req.response.error('Jugador no encontrado');

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

async function buyItem(req, res) {
    try {
        const playerId = req.body.playerId;
        const productId = req.body.productId;
        const productType = req.body.productType;

        const player = await Player.findOne({ uid: playerId });
        if (!player) return req.response.error('Jugador no encontrado');

        const playerCoins = player.coins || 0;

        const product = await (productType === 'deck' ? Deck : Avatars).findById(productId);

        switch (productType) {
            case 'deck':
                if (!product || !product.price) return req.response.error('Deck no encontrado o sin precio');

                if (playerCoins < product.price) return req.response.error('No tienes suficientes monedas para comprar este deck');

                await Player.updateOne(
                    { uid: playerId },
                    {
                        $push: { owned_decks: productId },
                        $pull: { locked_decks: productId },
                        $inc: { coins: -product.price }
                    }
                );

                break;
            case 'avatar':
                if (!product || !product.price) return req.response.error('Avatar no encontrado o sin precio');

                if (playerCoins < product.price) return req.response.error('No tienes suficientes monedas para comprar este avatar');

                await Player.updateOne(
                    { uid: playerId },
                    {
                        $push: { unlocked_avatars: productId },
                        $pull: { locked_avatars: productId },
                        $inc: { coins: -product.price }
                    }
                );

                break;
            default:
                return req.response.error('Tipo de producto no válido');
        }

        req.response.success({ message: 'Compra realizada con éxito' });
    } catch (error) {
        req.response.error(`Error al comprar el ítem: ${error.message}`);
    }
}

module.exports = {
    createPlayer,
    getPlayerInfo,
    checkPlayerExists,
    getPlayers,
    updatePlayer,
    deletePlayer,
    updatePlayerAvatar,
    buyItem
};