const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
    name: {type: String, required: true},
    type: {type: String, required: true},
    abilities: {type: [String], required: false},
    description: {type: String, required: false},
    atk: {type: Number, required: false},
    def: {type: Number, required: false},
    effect: {type: String, required: false},
    cost: {type: Number, required: false},
    set: {type: String, required: false},
    front_image: {type: String, required: false},
    back_image: {type: String, required: false},
    secret_front_image: {type: String, required: false},
});

const Card = mongoose.model('Card', cardSchema);

module.exports = Card;