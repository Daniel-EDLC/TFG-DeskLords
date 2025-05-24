const { startGame } = require('../services/gameStartService');
const { attack, defend, switchPhase, useCard } = require('../services/playerActionsService');

module.exports = {
  startGame,
  useCard,
  attack,
  defend,
  switchPhase,
};
