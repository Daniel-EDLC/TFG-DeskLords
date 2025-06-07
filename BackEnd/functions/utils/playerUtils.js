const Deck = require('../models/Deck');
const Avatars = require('../models/Avatars');
const Map = require('../models/Map');

async function getMapsAvailable(player) {

    const playerUnlockedMaps = await Promise.all(
        player.maps_unlocked.map(async mapId => {
            const map = await Map.findById(mapId);
            if (!map) { return null; }
            return { ...map.toObject?.() ?? map, available: true };
        })
    );

    const playerLockedMaps = await Promise.all(
        player.maps_locked.map(async mapId => {
            const map = await Map.findById(mapId);
            if (!map) { return null; }
            return { ...map.toObject?.() ?? map, available: false };
        })
    );

    const maps = [
        ...playerUnlockedMaps.filter(Boolean),
        ...playerLockedMaps.filter(Boolean),
    ];

    const allMaps = maps.map(map => ({
        name: map.name,
        id: map._id,
        image: map.image,
        available: map.available,
    }));

    return allMaps;
}

async function getDecksAvailable(player) {
    const playerOwnedDecks = await Promise.all(
        player.owned_decks.map(async deckId => {
            const deck = await Deck.findById(deckId);
            if (!deck) { return null; }
            return { ...deck.toObject?.() ?? deck, available: true };
        })
    );

    const playerLockedDecks = await Promise.all(
        player.locked_decks.map(async deckId => {
            const deck = await Deck.findById(deckId);
            if (!deck) { return null; }
            return { ...deck.toObject?.() ?? deck, available: false };
        })
    );

    const allDecks = [
        ...playerOwnedDecks.filter(Boolean),
        ...playerLockedDecks.filter(Boolean),
    ];

    return allDecks;
}

async function getAvatarsAvailable(player) {
    const playerOwnedAvatars = await Promise.all(
        player.unlocked_avatars.map(async avatarId => {
            const avatar = await Avatars.findById(avatarId);
            if (!avatar) { return null; }
            return { ...avatar.toObject?.() ?? avatar, available: true };
        })
    );

    const playerLockedAvatars = await Promise.all(
        player.locked_avatars.map(async avatarId => {
            const avatar = await Avatars.findById(avatarId);
            if (!avatar) { return null; }
            return { ...avatar.toObject?.() ?? avatar, available: false };
        })
    );

    const allAvatars = [
        ...playerOwnedAvatars,
        ...playerLockedAvatars,
    ];

    return allAvatars;
}

module.exports = {
    getMapsAvailable,
    getDecksAvailable,
    getAvatarsAvailable
}