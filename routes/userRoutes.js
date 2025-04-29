const router = require('express').Router();
const user = require('../controllers/userControllers');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn } = require('../middleware.js');

router.route('/')
    .get(catchAsync(user.getUsers));


router.route('/login')
    .post(catchAsync(user.login));


router.route('/register')
    .post(catchAsync(user.register));

router.route('/update-profile/:id')
    .put(catchAsync(user.updateProfile));

router.route('/logout')
    .get(catchAsync(user.logout));


router.route('/forgotpassword')
    .post(catchAsync(user.forgotPassword));


router.route('/resetpassword/:userId/:token')
    .post(catchAsync(user.resetPassword));


router.route('/profile')
    .get(isLoggedIn, catchAsync(user.profile));


router.route('/verify-otp')
    .post(user.verifyOtp);

router.route('/getuserbyid')
    .get(catchAsync(user.getUserByID));


module.exports = router;