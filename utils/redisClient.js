const redis = require('redis');
require('dotenv').config();

const client = redis.createClient({
    socket: {
        host: process.env.REDIS_HOST,
        port: Number(process.env.REDIS_PORT)
    },
    password: process.env.REDIS_PASSWORD
});

client.on('error', (err) => {
    console.error('❌ Redis error:', err);
});

client.connect()
    .then(() => console.log('✅ Connected to Redis Cloud'))
    .catch((err) => console.error('❌ Redis connection error:', err));

module.exports = client;
