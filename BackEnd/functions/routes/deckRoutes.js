const express = require('express');
const router = express.Router();
const { createDeck } = require('../controllers/deckController');

router.post('/createDeck', createDeck);

module.exports = router;