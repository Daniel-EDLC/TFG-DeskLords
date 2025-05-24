const mongoose = require('mongoose');

const setSchema = new mongoose.Schema({
    name: {type: String, required: true},
    description: {type: String, required: false},
    release_date: {type: Date, default: Date.now, immutable: true, required: true}
});

const Set = mongoose.model('Set', setSchema);

module.exports = Set;