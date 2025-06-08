const express = require('express');
const router = express.Router();
const {
  startGame,
  useCard,
  attack,
  defend,
  switchPhase,
  surrender
} = require('../controllers/gameController');

router.post('/startGame', startGame);
router.post('/useCard', useCard);
router.post('/attack', attack);
router.post('/defend', defend);
router.post('/switchPhase', switchPhase);
router.post('/surrender', surrender);

module.exports = router;