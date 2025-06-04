const express = require('express');
const router = express.Router();
const { createNews, getNews, updateNews, deleteNews } = require('../controllers/newsController');

router.post('/createNews', createNews);
router.get('/getNews', getNews);
router.put('/updateNews', updateNews);
router.post('/deleteNews', deleteNews);

module.exports = router;