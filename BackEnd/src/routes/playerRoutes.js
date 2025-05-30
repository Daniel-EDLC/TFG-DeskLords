const express = require('express');
const router = express.Router();
const { createPlayer, getPlayerInfo, checkPlayerExists } = require('../controllers/playerController');

router.post('/createPlayer', createPlayer);
router.post('/getPlayerInfo', getPlayerInfo);
router.post('/checkPlayerExists', checkPlayerExists);

module.exports = router;