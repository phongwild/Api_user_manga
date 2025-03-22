const mongoose = require('mongoose');

// Tạo Schema OTP
const otpSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    otp: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    expiresAt: { type: Date, required: true }
});

module.exports = mongoose.model('Otp', otpSchema);