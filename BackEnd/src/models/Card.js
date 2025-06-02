const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    // Campos obligatorios
    name: {type: String, required: true},
    type: {type: String, required: true, enum: ['creature', 'spell', 'equipement']},
    description: {type: String, required: true},
    element: {type: String, required: true},
    atk: {type: Number, required: false},
    hp: {type: Number, required: false},
    cost: {type: Number, required: true},
    front_image: {type: String, required: false}, // Cambiar a true cuando tengamos las imágenes
    back_image: {type: String, required: false}, // Cambiar a true cuando tengamos las imágenes
    // Campos opcionales
    abilities: {type: [String], required: false, default: []},
    temporaryAbilities: {type: [String], required: false, default: []},
    equipements: {type: [mongoose.Schema.Types.Mixed], required: false, default: []}, // Evita referencia circular
    effect: {type: String, required: false},
    target: {type: mongoose.Schema.Types.Mixed, required: false}, // Evita referencia circular
    set: {type: String, required: false},
    position: {type: String, required: false},
    alive: {type: Boolean, required: false, default: true},
    // secret_front_image: {type: String, required: false}  DEPENDEDIENO DE COMO VAYAMOS MIRAMOS SI LO HACEMOS O NO
});

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;