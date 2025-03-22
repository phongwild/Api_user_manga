const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');
const sendOtp = require('../utils/sendOTP');
const otpModel = require('../models/otpModel');
const redisClient = require('../utils/redisClient');

const OTP_RATE_LIMIT = 5; // Số lần tối đa gửi OTP trong thời gian giới hạn
const OTP_RATE_LIMIT_TIME = 60 * 5; // 5 phút (300 giây)
const OTP_THROTTLE_TIME = 30; // 30 giây giữa 2 lần gửi OTP

module.exports.getUsers = async (req, res) => {
    try {
        const { search, uid } = req.query;
        let users;

        if (!uid) {
            return res.status(400).json({ message: 'Missing user ID' });
        }

        if (search) {
            // const isObjectId = mongoose.Types.ObjectId.isValid(search);
            users = await User.find({
                $and: [
                    { _id: { $ne: uid } }, // Loại trừ người tìm kiếm
                    {
                        $or: [
                            { username: { $regex: search, $options: 'i' } },
                            { email: { $regex: search, $options: 'i' } }
                        ]
                    }
                ]
            });
        } else {
            users = await User.find({ _id: { $ne: uid } });
        }
        res.status(200).json(users);
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ message: `Internal server error + ${error}` });
    }
}

module.exports.login = async (req, res) => {
    let { email, password } = req.body;
    if (!email || !password) res.status(400).json('missing fields');
    else {
        email = email.toLowerCase();
        const user = await User.findOne({ email: email });
        if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ id: user._id }, `${process.env.SECRET}`, { expiresIn: '30d' });
            res.cookie('jwt', token, { signed: true, httpOnly: true, maxAge: 1000 * 60 * 60 }).json(user);
        }
        else {
            res.status(400).json('login failed');
        }
    }
}

module.exports.register = async (req, res) => {
    let { username, email, password } = req.body;
    email = email.toLowerCase();
    const registeredEmail = await User.findOne({ email });

    if (registeredEmail) {
        return res.status(400).json('Email đã tồn tại');
    }

    const currentTime = Date.now();

    // Kiểm tra rate limit trong Redis
    const rateLimitKey = `otp_limit:${email}`;
    const lastRequestKey = `otp_last_request:${email}`;

    try {
        const otpCount = await redisClient.get(rateLimitKey);
        const lastRequestTime = await redisClient.get(lastRequestKey);

        // Nếu đã đạt giới hạn, không cho gửi thêm
        if (otpCount && otpCount >= OTP_RATE_LIMIT) {
            return res.status(429).json('Quá nhiều yêu cầu OTP. Hãy thử lại sau.');
        }

        // Nếu gửi OTP quá nhanh (dưới 30 giây), từ chối gửi
        if (lastRequestTime && currentTime - lastRequestTime < OTP_THROTTLE_TIME * 1000) {
            const waitTime = Math.ceil((OTP_THROTTLE_TIME * 1000 - (currentTime - lastRequestTime)) / 1000);
            return res.status(429).json(`Hãy đợi ${waitTime} giây trước khi gửi OTP tiếp theo.`);
        }

        // Tạo OTP ngẫu nhiên
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // Hết hạn sau 5 phút

        // Lưu OTP vào MongoDB
        await otpModel.findOneAndUpdate(
            { email },
            { email, username, password, otp, expiresAt },
            { upsert: true, new: true }
        );

        // Cập nhật rate limit trên Redis
        await redisClient.incr(rateLimitKey); // Tăng số lần gửi OTP
        await redisClient.expire(rateLimitKey, OTP_RATE_LIMIT_TIME); // Đặt thời gian hết hạn cho key
        await redisClient.set(lastRequestKey, currentTime); // Lưu thời gian gửi OTP gần nhất
        await redisClient.expire(lastRequestKey, OTP_THROTTLE_TIME); // Key này sẽ hết hạn sau 30 giây

        // Gửi OTP qua email
        const result = await sendOtp(email, username, otp);
        if (result.success) {
            return res.status(200).json('OTP đã được gửi đến email của bạn!');
        } else {
            return res.status(500).json({ message: 'Lỗi khi gửi OTP', error: result.error });
        }
    } catch (error) {
        console.error('❌ Lỗi Redis:', error);
        return res.status(500).json('Lỗi máy chủ');
    }
};


//Verify otp
module.exports.verifyOtp = async (req, res) => {
    let { email, otp } = req.body;
    email = email.toLowerCase();

    try {
        // Kiểm tra OTP trong MongoDB
        const userOtp = await otpModel.findOne({ email });
        if (!userOtp) {
            return res.status(400).json('OTP không hợp lệ hoặc đã hết hạn.');
        }

        // Kiểm tra OTP có khớp không
        if (userOtp.otp !== otp) {
            return res.status(400).json('OTP không chính xác. Vui lòng thử lại.');
        }

        // Kiểm tra xem OTP đã hết hạn chưa
        if (userOtp.expiresAt < Date.now()) {
            await otpModel.deleteOne({ email });
            return res.status(400).json('OTP đã hết hạn. Vui lòng yêu cầu mã mới.');
        }

        // Nếu OTP hợp lệ, đăng ký tài khoản
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(userOtp.password, salt);

        await User.create({ username: userOtp.username, email: userOtp.email, password: hash });

        // Xóa OTP khỏi MongoDB
        await otpModel.deleteOne({ email });

        // Xóa rate limit trong Redis
        const rateLimitKey = `otp_limit:${email}`;
        await redisClient.del(rateLimitKey);

        res.status(201).json('Đăng ký thành công!');
    } catch (error) {
        console.error('❌ Lỗi khi xác minh OTP:', error);
        return res.status(500).json('Lỗi máy chủ.');
    }
};

module.exports.logout = (req, res) => {
    res.clearCookie('jwt').json('logout');
};

module.exports.profile = async (req, res) => {
    const token = req.signedCookies.jwt;
    if (token) {
        const decoded = jwt.verify(token, `${process.env.SECRET}`);
        const user = await User.findById(decoded.id);
        res.json(user);
    }
    else {
        res.status(400).json('no token');
    }
}

module.exports.forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
        const secret = `${process.env.SECRET}${user.password}`;
        const token = jwt.sign({ id: user._id }, secret, { expiresIn: '5m' });

        // Configure nodemailer with Gmail service
        let config = {
            service: 'gmail',
            auth: {
                user: `${process.env.EMAIL}`,
                pass: `${process.env.PASSWORD}`
            }
        };

        let transporter = nodemailer.createTransport(config);

        // Create email body using Mailgen
        let MailGenerator = new Mailgen({
            theme: 'default',
            product: {
                name: 'Netflix API',
                link: 'https://mailgen.js/'
            }
        });

        var response = {
            body: {
                name: user.username, // Use user's name to personalize
                intro: 'We received a request to reset the password for your account.',
                action: {
                    instructions: 'To reset your password, please click the button below:',
                    button: {
                        color: '#4CAF50', // Green button for better contrast
                        text: 'Reset Password',
                        link: `${req.protocol}://${req.get('host')}/user/resetpassword/${user._id}/${token}`
                    }
                },
                outro: 'If you didn’t request a password reset, please ignore this email. Your password will remain unchanged.',
                signature: 'Best regards, Netflix API'
            }
        };

        // Generate email HTML content
        var emailBody = MailGenerator.generate(response);

        let message = {
            from: `${process.env.EMAIL}`,
            to: `${email}`,
            subject: 'Password Reset Request',
            html: emailBody
        };

        transporter.sendMail(message)
            .then(() => res.status(201).json('Email sent successfully!'))
            .catch((err) => res.status(400).json({ message: 'Error sending email', error: err }));

    } else {
        res.status(400).json('Email not registered');
    }
};

module.exports.resetPassword = async (req, res) => {
    const { id, token } = req.params;
    const { password } = req.body;
    const oldUser = await User.findById(id);
    if (!oldUser) {
        res.status(400).json('user not found');
    }
    else {
        const secret = `${process.env.SECRET}${oldUser.password}`;
        if (jwt.verify(token, secret)) {
            oldUser.password = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
            await oldUser.save();
            res.json('password changed');
        }
        else {
            res.status(400).json('invalid token');
        }
    }

}

module.exports.getUserByID = async (req, res) => {
    try {
        const id = req.query.id;

        // Tìm user theo ID
        const user = await User.findById(id);

        // Kiểm tra nếu không tìm thấy user
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Trả về thông tin user nếu tìm thấy
        return res.status(200).json(user);
    } catch (error) {
        // Xử lý lỗi
        return res.status(500).json({ success: false, error: error.message });
    }
};

module.exports.updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const update = req.body;

        //check user
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        //update user
        const updateUser = await User.findByIdAndUpdate(id, update, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: updateUser });
    } catch (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
}

