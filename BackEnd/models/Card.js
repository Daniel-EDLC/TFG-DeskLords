const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    name: {type: String, required: true},
    type: {type: String, required: true},
    abilities: {type: [String], required: false, default: []},
    temporaryAbilities: {type: [String], required: false, default: []},
    description: {type: String, required: true},
    element: {type: String, required: true},
    atk: {type: Number, required: true},
    hp: {type: Number, required: true},
    effect: {type: String, required: false},
    cost: {type: Number, required: true},
    set: {type: String, required: false},
    front_image: {type: String, required: false},
    back_image: {type: String, required: false},
    // secret_front_image: {type: String, required: false}  DEPENDEDIENO DE COMO VAYAMOS MIRAMOS SI LO HACEMOS O NO
});

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;