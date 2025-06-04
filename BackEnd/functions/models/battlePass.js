const moongose = require('mongoose');

const levelSchema = new moongose.Schema({
    type: { type: String, required: true },
    rewards: { type: moongose.Schema.Types.Mixed, required: true },
    completed: { type: Boolean, default: false },
});

const battlePassSchema = new moongose.Schema({
    playerId: { type: String, required: true },
    actual_level: { type: Number, default: 0 },
    levels: { type: [levelSchema], required: false },
});

const BattlePassLevels = moongose.model('BattlePassLevels', levelSchema);
const BattlePass = moongose.model('BattlePass', battlePassSchema);

module.exports = {
    BattlePass,
    BattlePassLevels
};