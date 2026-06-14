const express = require("express");
const router = express.Router();
const rcmCtrl = require('../controllers/recommendControllers');
const mangadexSyncService = require('../services/mangadexSyncService');
const { isLoggedIn } = require("../middleware");


router.route('/cache').
    post(rcmCtrl.cacheManga);

router.route('/')
    .get(isLoggedIn, rcmCtrl.getRecommendations);

router.route('/sync-manga')
    .post(mangadexSyncService.syncMangadex);

module.exports = router;    