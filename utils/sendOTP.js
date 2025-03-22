const nodemailer = require('nodemailer');

async function sendOtp(email, username, otp) {
    try {
        // Cấu hình transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD
            }
        });

        // Nội dung email theo phong cách Manga
        const emailBody = `
            <div style="font-family: 'Arial', sans-serif; text-align: center; background-color: #fff5f7; padding: 20px; border-radius: 10px; border: 2px solid #ff8fa3;">
                <img src="https://i.gyazo.com/a1a30e12c13724e365822ed3d4f04ad9.png" alt="Manga OTP" width="100" style="margin-bottom: 10px;">
                <h2 style="color: #ff4d6d;">Xin chào, ${username}!</h2>
                <p style="font-size: 18px; color: #333;">Bạn vừa yêu cầu mã xác thực OTP</p>
                <p style="font-size: 24px; font-weight: bold; color: #ff1654; background-color: #ffe5ec; display: inline-block; padding: 10px 20px; border-radius: 5px;">${otp}</p>
                <p style="font-size: 16px; color: #666;">Mã OTP này có hiệu lực trong <b>5 phút</b>.</p>
                <p style="font-size: 14px; color: #999;">❌ Không chia sẻ mã này với bất kỳ ai ❌</p>
                <hr style="border: 1px dashed #ff8fa3; margin: 20px 0;">
                <p style="font-size: 14px; color: #999;">Nếu bạn không yêu cầu mã OTP này, hãy bỏ qua email này.</p>
            </div>
        `;

        const message = {
            from: process.env.EMAIL,
            to: email,
            subject: `Mã OTP của bạn là ${otp}`,
            html: emailBody
        };

        // Gửi email
        await transporter.sendMail(message);
        return { success: true, message: 'Gửi mã OTP thành công' };
    } catch (error) {
        console.error('Lỗi khi gửi OTP:', error);
        return { success: false, message: 'Gửi mã OTP thất bại', error };
    }
}

module.exports = sendOtp;
