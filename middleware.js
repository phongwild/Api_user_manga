require('dotenv').config();

const jwt = require('jsonwebtoken');
const User = require('./models/userModel');

module.exports.isLoggedIn = async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({
            message: 'No token'
        });
    }

    try {
        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(
            token,
            process.env.ACCESS_SECRET
        );

        const user = await User.findById(
            decoded.id
        );

        if (!user) {
            return res.status(401).json({
                message: 'Invalid token'
            });
        }

        req.user = user;

        next();
    } catch (error) {
        console.error(error);

        return res.status(401).json({
            message: 'Invalid token'
        });
    }
};