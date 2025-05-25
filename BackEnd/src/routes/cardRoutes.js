const express = require('express');
const router = express.Router();
const { createCard } = require('../controllers/cardController');

router.post('/createCard', createCard);

module.exports = router;