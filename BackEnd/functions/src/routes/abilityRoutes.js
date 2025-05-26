const express = require('express');
const router = express.Router();
const { createAbility } = require('../controllers/abilityController');

router.post('/createAbility', createAbility);

module.exports = router;