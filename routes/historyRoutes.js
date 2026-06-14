const router = require('express').Router();
const catchAsync = require('../utils/catchAsync');
const historyCtrl = require('../controllers/historyControllers');
const { isLoggedIn } = require('../middleware');

router.route('/add/:uid')
    .post(catchAsync(historyCtrl.history));


router.route('/')
    .get(isLoggedIn, catchAsync(historyCtrl.getList));

router.route('/clear/:uid')
    .delete(catchAsync(historyCtrl.clearOldHistory));

router.route('/remove/:uid')
    .post(catchAsync(historyCtrl.removeHistory));


module.exports = router;