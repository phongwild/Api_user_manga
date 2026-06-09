const jwt = require('jsonwebtoken');

exports.generateAccessToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.ACCESS_SECRET,
        { expiresIn: '15m' }
    );
};

exports.generateRefreshToken = (
    userId,
    tokenVersion
) => {
    return jwt.sign(
        {
            id: userId,
            tokenVersion
        },
        process.env.REFRESH_SECRET,
        { expiresIn: '30d' }
    );
};