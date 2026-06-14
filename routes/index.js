const express = require('express');
const router = express.Router();

const user = require('../routes/userRoutes');
const follow = require('../routes/followRoutes');
const history = require('../routes/historyRoutes');
const comment = require('../routes/commentRoutes');
const auth = require('../routes/authRoutes');
const upload = require('../routes/uploadRoute');
const reading = require('../routes/readingRoutes');
const recommend = require('../routes/recommendRoutes');
const mangadex = require('../routes/proxyMangaDexRoutes');

router.use('/user', require('./userRoutes'));
router.use('/follow', require('./followRoutes'));
router.use('/history', require('./historyRoutes'));
router.use('/comments', require('./commentRoutes'));
router.use('/auth', require('./authRoutes'));
router.use('/upload', require('./uploadRoute'));
router.use('/reading', require('./readingRoutes'));
router.use('/recommend', require('./recommendRoutes'));
router.use('/mangadex', require('./proxyMangaDexRoutes'));

module.exports = router;