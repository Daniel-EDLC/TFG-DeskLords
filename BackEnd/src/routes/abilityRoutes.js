const express = require('express');
const router = express.Router();
const { createAbility, getAbilities, updateAbility } = require('../controllers/abilityController');

router.post('/createAbility', createAbility);
router.get('/getAbilities', getAbilities);
router.put('/updateAbility', updateAbility);

module.exports = router;