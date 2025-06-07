const express = require('express');
const router = express.Router();
const { getBattlePass, createBattlePass, deleteBattlePass } = require('../controllers/battlePassController');

router.get('/getBattlePass', getBattlePass);
router.post('/createBattlePass', createBattlePass);
router.post('/deleteBattlePass', deleteBattlePass);

module.exports = router;