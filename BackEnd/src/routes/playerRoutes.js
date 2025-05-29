const express = require('express');
const router = express.Router();
const { createPlayer, getPlayerInfo } = require('../controllers/playerController');

router.post('/createPlayer', createPlayer);
router.post('/getPlayerInfo', getPlayerInfo);

module.exports = router;