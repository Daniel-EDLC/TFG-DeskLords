const express = require('express');
const router = express.Router();
const { createMap, updateMap, getMaps, deleteMap } = require('../controllers/mapController');

router.post('/createMap', createMap);
router.post('/updateMap', updateMap);
router.get('/getMaps', getMaps);
router.post('/deleteMap', deleteMap);

module.exports = router;