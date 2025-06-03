const mongoose = require('mongoose');
const cardSchema = require('./Card').schema;

const deckSchema = new mongoose.Schema({
    name: {type: String, required: true},
    cards: {type: [cardSchema], required: true},
    description: {type: String, required: false},
    image: {type: String, required: false},
    belongsTo: {type: String, enum: ['shop', 'history'] ,required: false}, // Cambiar a true cuando tenga los mazos definitivos
})

const Deck = mongoose.model('Deck', deckSchema);

module.exports = Deck;