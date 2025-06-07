const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
    type: { type: String, required: true },
    rewards: { type: mongoose.Schema.Types.Mixed, required: true },
    completed: { type: Boolean, default: false },
});

const battlePassSchema = new mongoose.Schema({
    playerId: { type: String, required: true },
    actual_level: { type: Number, default: 0 },
    levels: { type: [levelSchema], required: false },
});
const BattlePass = mongoose.model('BattlePass', battlePassSchema);

module.exports = BattlePass