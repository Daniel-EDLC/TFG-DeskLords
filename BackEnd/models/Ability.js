const mongoose = require('mongoose');

const abilitySchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: false},
})

const Ability = mongoose.model('Ability', abilitySchema);

module.exports = Ability;