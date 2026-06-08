const express = require('express');
const passport = require('passport');
const router = express.Router();
const authCtrl = require('../controllers/authControllers')
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn } = require('../middleware.js');

router.post('/login/google', authCtrl.loginMobile);

router.route('/login')
    .post(catchAsync(authCtrl.login));

router.route('/register')
    .post(catchAsync(authCtrl.register));

router.route('/verify-otp')
    .post(authCtrl.verifyOtp);

router.route('/logout')
    .get(catchAsync(authCtrl.logout));

router.route('/change-password/:id')
    .put(catchAsync(authCtrl.changePassword));

router.route('/forgotpassword')
    .post(catchAsync(authCtrl.forgotPassword));

router.route('/resetpassword/:userId/:token')
    .post(catchAsync(authCtrl.resetPassword));

module.exports = router;
