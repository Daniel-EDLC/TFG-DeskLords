const mongoose = require('mongoose');
const DeckSchema = require('./Deck').schema;

const gameSchema = new mongoose.Schema({
    status: {type: String, required: true, enum: ['in-progress', 'abandoned', 'finished'], default: 'in-progress'},
    startTime: {type: Date, required: true, default: Date.now},
    endTime: {type: Date, required: false},
    playerId: {type: String, required: true},
    playerHp: {type: Number, required: true, default: 30},
    rivalHp: {type: Number, required: true, default: 30},
    currentTurn: {type: Number, required: true, default: 0},
    winner: {type: String, required: false},
    playerDeck: {type: DeckSchema, required: true},
    // rivalDeck: {type: DeckSchema, required: true},
    mapId: {type: String, required: true},
    manaPerTurn: {type: Number, required: true, default: 1},
    // turnTimeLimit: {type: Number, required: true}, PODEMOS LLEGAR A AÑADIRLO
    // gameTimeLimit: {type: Number, required: true}, PODEMOS LLEGAR A AÑADIRLO
})

const Game = mongoose.model('Game', gameSchema);

module.exports = Game;