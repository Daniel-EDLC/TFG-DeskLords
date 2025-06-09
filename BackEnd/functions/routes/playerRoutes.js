const express = require('express');
const router = express.Router();
const { createPlayer, getPlayerInfo, checkPlayerExists, updatePlayer, getPlayers, deletePlayer, updatePlayerAvatar, buyItem } = require('../controllers/playerController');

router.post('/createPlayer', createPlayer);
router.post('/getPlayerInfo', getPlayerInfo);
router.post('/checkPlayerExists', checkPlayerExists);
router.put('/updatePlayer', updatePlayer);
router.get('/getPlayers', getPlayers);
router.post('/deletePlayer', deletePlayer);
router.put('/changeAvatar', updatePlayerAvatar);
router.post('/buyItem', buyItem);

module.exports = router;