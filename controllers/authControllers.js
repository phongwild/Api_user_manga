const { OAuth2Client } = require('google-auth-library');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.loginMobile = async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        return res.status(400).json({ status: false, message: 'Missing Google ID token' });
    }

    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { email, name, picture, sub: googleId } = payload;
        let user = await User.findOne({ googleId });
        if (!user) {
            user = await User.findOne({ email });
            if (user) {
                user.googleId = googleId;
                await user.save();
            } else {
                user = new User({
                    googleId,
                    email,
                    username: name || `User-${Date.now()}`,
                    avatar: picture,
                    password: Math.random().toString(36).slice(-8)
                });
                await user.save();
            }
        }
        const token = jwt.sign({ id: user._id }, `${process.env.SECRET}`, { expiresIn: '30d' });
        res.cookie('jwt', token, { signed: true, httpOnly: true, maxAge: 1000 * 60 * 60 }).json(user);
    } catch (error) {
        res.status(500).json({ status: false, message: 'Internal Server Error', error: error.message });
    }
}