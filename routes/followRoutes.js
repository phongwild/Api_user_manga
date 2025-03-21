const router = require('express').Router();
const catchAsync = require('../utils/catchAsync');
const followCtrl = require('../controllers/followControllers');

router.route('/:uid')
    .get(catchAsync(followCtrl.getList));

router.route('/add/:uid')
    .post(catchAsync(followCtrl.follow));

router.route('/remove/:uid')
    .post(catchAsync(followCtrl.remove_manga_from_follows));


module.exports = router;