const express = require('express');
const router = express.Router();
const { createSet } = require('../controllers/setController');

router.post('/createSet', createSet);

module.exports = router;