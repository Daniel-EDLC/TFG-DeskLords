const express = require('express');
const router = express.Router();
const { createMap } = require('../controllers/mapController');

router.post('/createMap', createMap);

module.exports = router;