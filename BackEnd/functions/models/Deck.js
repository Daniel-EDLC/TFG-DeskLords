const mongoose = require('mongoose');
const cardSchema = require('./Card').schema;

const deckSchema = new mongoose.Schema({
    name: {type: String, required: true},
    cards: {type: [cardSchema], required: true},
    description: {type: String, required: false},
    image: {type: String, required: false},
})

const Deck = mongoose.model('Deck', deckSchema);

module.exports = Deck;