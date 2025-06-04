const express = require('express');
const router = express.Router();
const { createPlayer, getPlayerInfo, checkPlayerExists, updatePlayer, getPlayers, deletePlayer, updatePlayerAvatar } = require('../controllers/playerController');

router.post('/createPlayer', createPlayer);
router.post('/getPlayerInfo', getPlayerInfo);
router.post('/checkPlayerExists', checkPlayerExists);
router.put('/updatePlayer', updatePlayer);
router.get('/getPlayers', getPlayers);
router.post('/deletePlayer', deletePlayer);
router.put('/updatePlayerAvatar', updatePlayerAvatar);

module.exports = router;