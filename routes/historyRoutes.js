const router = require('express').Router();
const catchAsync = require('../utils/catchAsync');
const historyCtrl = require('../controllers/historyControllers');

router.route('/add/:uid')
    .post(catchAsync(historyCtrl.history));


router.route('/:uid')
    .get(catchAsync(historyCtrl.getList));

router.route('/clear/:uid')
    .delete(catchAsync(historyCtrl.clearOldHistory));


module.exports = router;