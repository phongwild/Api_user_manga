const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const Mailgen = require('mailgen');

module.exports.login = async (req, res) => {
    let { email, password } = req.body;
    if (!email || !password) res.status(400).json('missing fields');
    else {
        email = email.toLowerCase();
        const user = await User.findOne({ email: email });
        if (user && bcrypt.compareSync(password, user.password)) {
            const token = jwt.sign({ id: user._id }, `${process.env.SECRET}`, { expiresIn: '1h' });
            res.cookie('jwt', token, { signed: true, httpOnly: true, maxAge: 1000 * 60 * 60 }).json('login');
        }
        else {
            res.status(400).json('login failed');
        }
    }
}



module.exports.register = async (req, res) => {
    let { username, email, password } = req.body;
    email = email.toLowerCase();
    const registeredEmail = await User.findOne({ email: email });

    if (registeredEmail) {
        res.status(400).json('email already exists');
    }

    else {
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        await User.create({ username, email, password: hash });
        res.json('register');
    }
}


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
                        link: `https://app-netflix-api.vercel.app/user/resetpassword/${user._id}/${token}`
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
