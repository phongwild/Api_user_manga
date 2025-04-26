const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/userModel'); // Đảm bảo đã có model User

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
},
    async (accessToken, refreshToken, profile, done) => {
        try {
            // Tìm theo googleId
            let user = await User.findOne({ googleId: profile.id });

            if (!user) {
                // Nếu không có theo googleId, tìm tiếp theo email
                user = await User.findOne({ email: profile.emails[0].value });

                if (user) {
                    // Nếu đã tồn tại email nhưng chưa gắn GoogleID => cập nhật googleId vào
                    user.googleId = profile.id;
                    await user.save();
                } else {
                    // Nếu hoàn toàn mới => tạo user mới
                    user = new User({
                        googleId: profile.id,
                        email: profile.emails[0].value,
                        username: profile.displayName || 'User-' + Date.now(),
                        password: generateRandomPassword(), // Random password vì không dùng login thường
                        avatar: profile.photos?.[0]?.value || ''
                    });
                    await user.save();
                }
            }

            return done(null, user);
        } catch (err) {
            return done(err, null);
        }
    }));

// Xử lý session
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Hàm random password (có thể random xịn hơn nếu cần nè ✨)
function generateRandomPassword() {
    return Math.random().toString(36).slice(-8); // Ví dụ random: 'ab12cd34'
}
