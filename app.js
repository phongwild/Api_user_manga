const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const ExpressError = require('./utils/ExpressError');
const cookieParser = require('cookie-parser');
const cron = require('node-cron');
const swaggerUi = require('swagger-ui-express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const passport = require('passport');
require('./config/passport');

// Kết nối MongoDB
const dbURL = process.env.DB_URL;
mongoose.connect(dbURL);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => console.log('Connected to database'));

// Middleware
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser(process.env.SECRET));
app.use(express.json());

// Middleware log time
app.use((req, res, next) => {
    const start = Date.now();

    res.on('finish', () => {
        console.log(
            `${req.method} ${req.originalUrl} - ${Date.now() - start}ms`
        );
    });

    next();
});

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

const routes = require('./routes/index');
app.use('/api', routes);

// Swagger setup
const swaggerPath = path.join(__dirname, 'swagger_output.json');
if (fs.existsSync(swaggerPath)) {
    const swaggerFile = JSON.parse(fs.readFileSync(swaggerPath, 'utf8'));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
} else {
    console.error('⚠️  swagger_output.json not found!');
}

// Xử lý route không tồn tại
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// Middleware xử lý lỗi
app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'Something went wrong' } = err;
    res.status(statusCode).json({ message });
});

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
});

// Chạy server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Swagger API Docs: http://localhost:${PORT}/api-docs`);
});

module.exports = app;