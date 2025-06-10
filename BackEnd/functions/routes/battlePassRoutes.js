const express = require('express');
const router = express.Router();
const { getBattlePasses, createBattlePass, deleteBattlePass } = require('../controllers/battlePassController');

router.get('/getBattlePasses', getBattlePasses);
router.post('/createBattlePass', createBattlePass);
router.post('/deleteBattlePass', deleteBattlePass);

module.exports = router;