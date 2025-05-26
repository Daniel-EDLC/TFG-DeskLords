const express = require('express');
const router = express.Router();
const {
  startGame,
  useCard,
  attack,
  defend,
  switchPhase
} = require('../controllers/gameController');

router.post('/startGame', startGame);
router.post('/useCard', useCard);
router.post('/attack', attack);
router.post('/defend', defend);
router.post('/switchPhase', switchPhase);

module.exports = router;