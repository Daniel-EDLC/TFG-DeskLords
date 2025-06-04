const express = require('express');
const router = express.Router();
const { createDeck, updateDeck, getDecks, deleteDeck } = require('../controllers/deckController');

router.post('/createDeck', createDeck);
router.put('/updateDeck', updateDeck);
router.get('/getDecks', getDecks);
router.post('/deleteDeck', deleteDeck);

module.exports = router;