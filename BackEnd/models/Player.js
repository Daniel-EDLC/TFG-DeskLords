const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    id: {type: String, required: true},
    state: {type: String, enum: ['active', 'suspended', 'banned', 'deleted']},
    name: {type: String, required: true},
    player_level: {type: Number, default: 0, required: false},
    profile_img: {type: String, required: false},
    owned_decks: {type: [String], required: false},
    actual_map: {type: String, required: false},
    actual_map_level: {type: Number, required: false},
    rol: {type: String, default: 'Player', required: true},
    register_date: {type: Date, default: Date.now, immutable: true, required: true}
})

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;