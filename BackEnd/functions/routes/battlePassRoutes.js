const express = require('express');
const router = express.Router();
const { getBattlePass, createBattlePass, updateBattlePass, deleteBattlePass } = require('../controllers/battlePassController');

router.get('/', getBattlePass);
router.post('/createBattlePass', createBattlePass);
router.put('/updateBattlePass/:playerId', updateBattlePass);
router.delete('/deleteBattlePass/:playerId', deleteBattlePass);

module.exports = router;