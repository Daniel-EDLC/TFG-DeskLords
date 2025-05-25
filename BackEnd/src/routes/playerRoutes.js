const express = require('express');
const router = express.Router();
const { createPlayer } = require('../controllers/playerController');

router.post('/createPlayer', createPlayer);

module.exports = router;