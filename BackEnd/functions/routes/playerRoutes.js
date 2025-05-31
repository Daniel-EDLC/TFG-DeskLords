const express = require('express');
const router = express.Router();
const { createPlayer, getPlayerInfo, checkPlayerExists, updatePlayer, getPlayers, deletePlayer } = require('../controllers/playerController');

router.post('/createPlayer', createPlayer);
router.post('/getPlayerInfo', getPlayerInfo);
router.post('/checkPlayerExists', checkPlayerExists);
router.post('/updatePlayer', updatePlayer);
router.get('/getPlayers', getPlayers);
router.post('/deletePlayer', deletePlayer);

module.exports = router;