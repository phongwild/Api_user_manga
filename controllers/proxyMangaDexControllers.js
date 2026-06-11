const axios = require('axios');
const dns = require('dns');
const https = require('https');

dns.setDefaultResultOrder('ipv4first');

const httpsAgent = new https.Agent({
    keepAlive: true,
    family: 4,
});

module.exports.proxy = async (req, res) => {
    try {
        const headers = {
            'Accept-Encoding': 'gzip, deflate, br',
        };

        if (req.headers['content-type']) {
            headers['Content-Type'] = req.headers['content-type'];
        }

        if (req.headers['authorization']) {
            headers['Authorization'] = req.headers['authorization'];
        }

        const config = {
            method: req.method,
            url: `https://api.mangadex.org${req.path}`,
            params: req.query,
            headers,
            httpsAgent,
            timeout: 10000,
        };

        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            config.data = req.body;
        }

        const response = await axios(config);

        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(response.status).json(response.data);
    } catch (error) {
        console.error('MangaDex request failed:', {
            code: error.code,
            message: error.message,
        });
        console.error({
            code: error.code,
            errno: error.errno,
            syscall: error.syscall,
            address: error.address,
            port: error.port
        });

        if (error.response) {
            return res.status(error.response.status).json(error.response.data);
        }

        return res.status(500).json({
            message: 'Không nhận được phản hồi từ MangaDex',
            error: error.message,
        });
    }
};