const { startGame, surrender } = require('../services/gameService');
const { attack, defend, switchPhase, useCard } = require('../services/playerActionsService');

module.exports = {
  startGame,
  useCard,
  attack,
  defend,
  switchPhase,
  surrender
};
