const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    status: {type: String, enum: ['active', 'suspended', 'banned', 'deleted'], default: 'active'},
    name: {type: String, required: true},
    surname: {type: String, required: true},
    displayName: {type: String, required: true},
    register_date: {type: Date, default: Date.now, immutable: true, required: true},
    profile_img: {type: String, required: false, default: 'https://example.com/default-avatar.png'}, // Default avatar URL
    player_level: {type: Number, default: 0, required: false},
    player_level_progress: {type: Number, default: 0, required: false}, // puntos de experiencia exactos
    owned_decks: {type: [String], required: false},
    locked_decks: {type: [String], required: false},
    maps_unlocked: {type: [String], required: false}, // Assuming you have a Map model
    maps_locked: {type: [String], required: false}, // Assuming you have a Map model
    // actual_map: {type: String, required: false},
    // actual_map_level: {type: Number, required: false},
    rol: {type: String, default: 'Player', required: true},
})

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;