const express = require('express');
const passport = require('passport');
const router = express.Router();
const authCtrl = require('../controllers/authControllers')

// Khởi tạo xác thực với Google
router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Xử lý callback từ Google
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Xác thực thành công, chuyển hướng đến trang chính
        res.redirect('/');
    }
);

// Đăng xuất
router.get('/logout', (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
});

router.post('/login', authCtrl.loginMobile);


module.exports = router;
