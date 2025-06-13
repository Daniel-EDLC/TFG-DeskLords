const mongoose = require('mongoose');
const deckSchema = require('./Deck').schema;
const cardSchema = require('./Card').schema;

const gameSchema = new mongoose.Schema({
    status: {type: String, required: true, enum: ['in-progress', 'surrendered', 'finished'], default: 'in-progress'},
    startTime: {type: Date, required: true, default: Date.now, immutable: true},
    endTime: {type: Date, required: false},
    playerId: {type: String, required: true},
    playerHp: {type: Number, required: true, default: 3},
    rivalHp: {type: Number, required: true, default: 3},
    currentTurn: {type: Number, required: true, default: 1},
    winner: {type: String, required: false, default: null},
    playerDeck: {type: deckSchema, required: false},
    playerHand: {type: [cardSchema], required: false},
    playerTable: {type: [cardSchema], required: false},
    playerGraveyard: {type: [cardSchema], required: false},
    playerPendingDeck: {type: [cardSchema], required: false},
    playerMana: {type: Number, required: true, default: 1},
    rivalDeck: {type: deckSchema, required: false},
    rivalHand: {type: [cardSchema], required: false},
    rivalTable: {type: [cardSchema], required: false},
    rivalGraveyard: {type: [cardSchema], required: false},
    rivalPendingDeck: {type: [cardSchema], required: false},
    rivalMana: {type: Number, required: true, default: 1},
    mapId: {type: String, required: true},
    manaPerTurn: {type: Number, required: true, default: 2}
    // turnTimeLimit: {type: Number, required: true}, PODEMOS LLEGAR A AÑADIRLO
    // gameTimeLimit: {type: Number, required: true}, PODEMOS LLEGAR A AÑADIRLO
})

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;