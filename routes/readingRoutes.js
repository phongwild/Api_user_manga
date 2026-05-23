const express = require("express");
const router = express.Router();
const readingCtrl = require('../controllers/readingControllers');
const catchAsync = require("../utils/catchAsync");

router.route('/:uid').
    post(catchAsync(readingCtrl.saveReadingProgress));

router.route('/:uid').
    get(catchAsync(readingCtrl.getAllReadingProgress));

router.route('/:uid/:mangaId').
    get(catchAsync(readingCtrl.getReadingProgress));

router.route('/:uid/:mangaId').
    delete(catchAsync(readingCtrl.removeReadingProgress));

module.exports = router;