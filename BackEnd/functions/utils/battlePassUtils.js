const BattlePass = require('../models/battlePass');

function generateDefaultLevels() {
  return [
    { type: 'coins', rewards: { coins: 50, image: ""} },
    { type: 'coins', rewards: { coins: 100, image: "" } },
    { type: 'coins', rewards: { coins: 150, image: "" } },
    { type: 'coins', rewards: { coins: 200, image: "" } },
    { type: 'avatar', rewards: { avatarId: 'IdDocumento', image: "" } },
    { type: 'coins', rewards: { coins: 250 }, image: "" },
    { type: 'coins', rewards: { coins: 300 }, image: "" },
    { type: 'coins', rewards: { coins: 350 }, image: "" },
    { type: 'coins', rewards: { coins: 400 }, image: "" },
    { type: 'deck', rewards: { deckId: '22222', image: "" } },
  ];
}

async function getBattlePassPlayer(idPlayer) {

  const battlePassData = await BattlePass.findOne({ playerId: idPlayer });

  const playerBattlePass = {
    levels: battlePassData.levels,
    actualLevel: battlePassData.actual_level,
    totalLevels: battlePassData.levels.length,
    completedLevels: battlePassData.completed_levels,
    rewards: battlePassData.rewards || []
  };

  return playerBattlePass;
}

module.exports = { generateDefaultLevels, getBattlePassPlayer };