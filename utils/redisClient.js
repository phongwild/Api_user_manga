const redis = require('redis');

const client = redis.createClient({
    socket: {
        host: 'redis-15145.c334.asia-southeast2-1.gce.redns.redis-cloud.com',
        port: 15145
    },
    password: 'gHq5TOfNfp9gXAxiFbpBsDKEuFV767nk'
});

client.on('error', (err) => {
    console.error('❌ Redis error:', err);
});

client.connect()
    .then(() => console.log('✅ Connected to Redis Cloud'))
    .catch((err) => console.error('❌ Redis connection error:', err));

module.exports = client;
