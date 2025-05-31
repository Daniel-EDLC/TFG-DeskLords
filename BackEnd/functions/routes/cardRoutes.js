const express = require('express');
const router = express.Router();
const { createCard, updateCard, getCards, deleteCard } = require('../controllers/cardController');

router.post('/createCard', createCard);
router.post('/updateCard', updateCard);
router.get('/getCards', getCards);
router.post('/deleteCard', deleteCard);

module.exports = router;