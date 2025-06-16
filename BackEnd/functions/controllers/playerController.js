const Player = require('../models/Player');
const Deck = require('../models/Deck');
const News = require('../models/News');
const Map = require('../models/Map');
const Avatars = require('../models/Avatars');
const { getMapsAvailable, getAvatarsAvailable, getDecksAvailable, getMostUsedDeck, getLostGames, getWinnedGames } = require('../utils/playerUtils');
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

        const allDecks = await Deck.find();
        if (!allDecks || allDecks.length === 0) return req.response.error("No se encontraron mazos disponibles");

        const defaultDeck = await allDecks.find(deck => deck._id.toString() === '68494b3ce206d6cf9f4ee3dd');
        if (!defaultDeck) return req.response.error("No se encontró el mazo por defecto");

        const lockedDecks = allDecks.filter(deck => deck._id.toString() !== '68494b3ce206d6cf9f4ee3dd');
        if (!lockedDecks || lockedDecks.length === 0) return req.response.error("No se encontraron mazos bloqueados");

        const allMaps = await Map.find();
        if (!allMaps || allMaps.length === 0) return req.response.error("No se encontraron mapas disponibles");

        const defaultMap = await allMaps.find(map => map._id.toString() === '684954af46950a12150b7c62');
        if (!defaultMap) return req.response.error("No se encontró el mapa por defecto");

        const lockedMaps = allMaps.filter(map => map._id.toString() !== '684954af46950a12150b7c62');
        if (!lockedMaps || lockedMaps.length === 0) return req.response.error("No se encontraron mapas bloqueados");

        const newPlayer = new Player({
            uid: req.body.uid,
            name: req.body.name,
            surname: req.body.surnames,
            displayName: req.body.displayName,
            owned_decks: [defaultDeck._id],
            locked_decks: lockedDecks.map(deck => deck._id),
            maps_unlocked: [defaultMap._id],
            maps_locked: lockedMaps.map(map => map._id),
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

    // Lanzar todas las consultas en paralelo
    const [
        allMaps,
        allDecks,
        allAvatars,
        avatarActive,
        newsFound,
        battlePass,
        mostUsedDeckId,
        lostGames,
        winnedGames,
        defualtDeck
    ] = await Promise.all([
        getMapsAvailable(player),
        getDecksAvailable(player),
        getAvatarsAvailable(player),
        Avatars.findById(player.selected_avatar),
        News.find().sort({ fecha: -1 }),
        getBattlePassPlayer(player.uid),
        getMostUsedDeck(player),
        getLostGames(player),
        getWinnedGames(player),
        Deck.findById(player.owned_decks[0])
    ]);

    const avatarUrl = avatarActive?.url;
    const playerXp = player.player_level_progress;

    let tutorial = false;
    if (playerXp == 0 && player.player_level == 0) {
        tutorial = true;
        await Player.updateOne(
            { uid: player.uid },
            { $inc: { player_level_progress: 1 } }
        );
    }

    const defaultDeckImage = defualtDeck?.image;

    const shopItems = {
        decks: allDecks.filter(deck => deck.belongsTo === 'shop'),
        avatars: allAvatars.filter(avatar => avatar.belongsTo === 'shop'),
    };

    req.response.success({
        playerAvatar: avatarUrl || "no lo encuentra",
        avatars: allAvatars || [],
        playerName: player.displayName || 'Jugador Anónimo',
        playerLevel: player.player_level,
        playerExperience: player.player_level_progress,
        rol: player.rol,
        coins: player.coins || 0,
        decks: allDecks || [],
        maps: allMaps || [],
        news: newsFound || [],
        shop: shopItems || [],
        battlePass: battlePass || {},
        tutorial: { mode: tutorial, defaultDeckImage: defaultDeckImage },
        favoriteDeck: mostUsedDeckId ? mostUsedDeckId.name : null,
        wins: winnedGames || 0,
        loses: lostGames || 0,
    });
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

        const updatedPlayer = await Player.findOneAndUpdate({ uid: playerId }, updatedData, { new: true });
        
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

        const player = await Player.findOne({ uid: playerId });

        const avatar = await Avatars.findById(avatarId);

        if (!player) return req.response.error('Jugador no encontrado');

        if (player.locked_avatars.includes(avatarId)) {
            return req.response.error('El avatar está bloqueado y no se puede seleccionar');
        }

        // 1. Añadir el avatar anterior a unlocked_avatars
        await Player.updateOne(
            { uid: playerId },
            { $addToSet: { unlocked_avatars: player.selected_avatar } }
        );

        // 2. Quitar el avatar actual de unlocked_avatars y ponerlo como seleccionado
        await Player.updateOne(
            { uid: playerId },
            {
                $set: { selected_avatar: avatarId },
                $pull: { unlocked_avatars: avatarId }
            }
        );

        req.response.success({ playerAvatar: avatar.url });
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

        console.log('productType', productType);

        const player = await Player.findOne({ uid: playerId });
        if (!player) return req.response.error('Jugador no encontrado');

        const playerCoins = player.coins || 0;
        console.log('playerCoins', playerCoins);

        const product = await (productType === 'deck' ? Deck : Avatars).findById(productId);
        console.log('product', product);

        switch (productType) {
            case 'Deck':
                try {
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

                    req.response.success({ message: 'Compra realizada con éxito' });
                } catch (error) {
                    return req.response.error(`Error al comprar el deck: ${error.message}`);
                }

                break;
            case 'Avatar':
                try {
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

                    console.log('Avatar comprado:', productId);

                    req.response.success({ message: 'Compra realizada con éxito' });
                } catch (error) {
                    return req.response.error(`Error al comprar el avatar: ${error.message}`);
                }

                break;
            default:
                return req.response.error('Tipo de producto no válido');
        }
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