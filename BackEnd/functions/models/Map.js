const mongoose = require('mongoose');
const deckSchema = require('./Deck').schema;

const mapSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: true},
    deck: {type: deckSchema, required: true},
    image: {type: String, required: false},
    element: {type: String, required: false},
});

const Map = mongoose.model('Map', mapSchema);

module.exports = Map;