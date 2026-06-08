const router = require('express').Router();
const user = require('../controllers/userControllers');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn } = require('../middleware.js');

router.route('/')
    .get(catchAsync(user.getUsers));

router.route('/update-profile/:id')
    .put(catchAsync(user.updateProfile));

router.route('/profile')
    .get(isLoggedIn, catchAsync(user.profile));

router.route('/getuserbyid')
    .get(catchAsync(user.getUserByID));


module.exports = router;