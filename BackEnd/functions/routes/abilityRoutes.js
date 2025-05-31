const express = require('express');
const router = express.Router();
const { createAbility, updateAbility, getAbilities, deleteAbility } = require('../controllers/abilityController');

router.post('/createAbility', createAbility);
router.post('/updateAbility', updateAbility);
router.get('/getAbilities', getAbilities);
router.post('/deleteAbility', deleteAbility);

module.exports = router;