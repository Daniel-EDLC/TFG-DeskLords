const mongoose = require('mongoose');

const abilitySchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: false},
    inscrisedAtk: {type: Number, required: false},
    inscrisedHp: {type: Number, required: false},
})

const Ability = mongoose.model('Ability', abilitySchema);

module.exports = Ability;