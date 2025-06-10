const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true }, // Firebase UID
    status: { type: String, enum: ['active', 'suspended', 'banned', 'deleted'], default: 'active' },
    name: { type: String, required: true },
    surname: { type: String, required: false },
    displayName: { type: String, required: true },
    register_date: { type: Date, default: Date.now, immutable: true, required: true },
    rol: { type: String, default: 'Player', required: true },

    // Campos de Experiencia
    player_level: { type: Number, default: 0, required: false },
    player_level_progress: { type: Number, default: 0, required: false }, // puntos de experiencia exactos

    // Campos de Mazos
    owned_decks: { type: [String], required: false, default: ["68445462751c23f738012ae9"] },
    locked_decks: { type: [String], required: false },

    // Campos de Mapas
    maps_unlocked: { type: [String], required: false },
    maps_locked: { type: [String], required: false },

    // Campos de la foto de perfil
    selected_avatar: { type: String, required: false },
    unlocked_avatars: { type: [String], required: false },
    locked_avatars: { type: [String], required: false },

    // Campos de Monedas
    coins: { type: Number, default: 0, required: false },
});

const Player = mongoose.model('Player', playerSchema);

module.exports = Player;