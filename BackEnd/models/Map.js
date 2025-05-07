const mongoose = require('mongoose');

const mapSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: false},
    victory_experience: {type: Number, required: false},
    defeat_experience: {type: Number, required: false},
    deck: {type: String, required: false},
    element: {type: String, required: false},
    cards: {type: [String], required: false},
});

const Map = mongoose.model('Map', mapSchema);

module.exports = Map;