const router = require('express').Router();
const catchAsync = require('../utils/catchAsync');
const proxyCtrl = require('../controllers/proxyMangaDexControllers');

router.use('/', proxyCtrl.proxy);

module.exports = router;