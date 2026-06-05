const express = require("express");
const router = express.Router();
const rcmCtrl = require('../controllers/recommendControllers');
const mangadexSyncService = require('../services/mangadexSyncService');


router.route('/cache').
    post(rcmCtrl.cacheManga);

router.route('/user/:uid')
    .get(rcmCtrl.getRecommendations);

router.route('/sync-manga')
    .post(mangadexSyncService.syncMangadex);

module.exports = router;    