const express = require('express');
const router = express.Router();
const { getAvatars, createAvatar, updateAvatar, deleteAvatar } = require('../controllers/avatarsController');

router.get('/getAvatars', getAvatars);
router.post('/createAvatar', createAvatar);
router.put('/updateAvatar', updateAvatar);
router.post('/deleteAvatar', deleteAvatar);

module.exports = router;
