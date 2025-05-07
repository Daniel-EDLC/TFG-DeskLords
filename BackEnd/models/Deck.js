const mongoose = require('mongoose');

const deckSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: false},
    cards: {type: [String], required: false},
    dificulty: {type: Number, required: false},
})

const Deck = mongoose.model('Deck', deckSchema);

module.exports = Deck;