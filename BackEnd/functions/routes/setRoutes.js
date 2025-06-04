const express = require('express');
const router = express.Router();
const { createSet, updateSet, getSets, deleteSet } = require('../controllers/setController');

router.post('/createSet', createSet);
router.put('/updateSet', updateSet);
router.get('/getSets', getSets);
router.post('/deleteSet', deleteSet);

module.exports = router;