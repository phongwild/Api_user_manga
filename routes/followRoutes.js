const router = require('express').Router();
const catchAsync = require('../utils/catchAsync');
const followCtrl = require('../controllers/followControllers');
const { isLoggedIn } = require('../middleware');

router.route('/')
    .get(isLoggedIn, catchAsync(followCtrl.getList));

router.route('/add/:uid')
    .post(catchAsync(followCtrl.follow));

router.route('/remove/:uid')
    .post(catchAsync(followCtrl.remove_manga_from_follows));

router.route('/check/:uid')
    .get(catchAsync(followCtrl.check_follow));

module.exports = router;