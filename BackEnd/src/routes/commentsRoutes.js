const express = require('express');
const router = express.Router();
const { createComment, updateComment, getComments, deleteComment } = require('../controllers/commentsController');

router.post('/createComment', createComment);
router.put('/updateComment', updateComment);
router.get('/getComments', getComments);
router.post('/deleteComment', deleteComment);

module.exports = router;