const express = require('express');
const router = express.Router();
const { getAvatars, createAvatar, updateAvatar, deleteAvatar } = require('../controllers/avatarsController');

router.get('/', getAvatars);
router.post('/createAvatar', createAvatar);
router.put('/updateAvatar/:id', updateAvatar);
router.delete('/deleteAvatar/:id', deleteAvatar);

module.exports = router;
