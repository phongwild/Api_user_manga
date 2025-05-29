const axios = require('axios');

module.exports.proxy = async (req, res) => {
    try {
        const targetUrl = `https://api.mangadex.org${req.url}`;

        const config = {
            method: req.method,
            url: targetUrl,
            headers: {
                'Content-Type': req.headers['content-type'] || 'application/json',
                'Authorization': req.headers['authorization'] || '',
                'Accept-Encoding': 'gzip, deflate, br',
            },
            timeout: 10000
        };

        if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
            config.data = req.body;
        }

        const response = await axios(config);

        res.setHeader('Access-Control-Allow-Origin', '*');

        // Trả về dữ liệu từ MangaDex
        res.status(response.status).json(response.data);

    } catch (error) {
        console.error('Lỗi proxy MangaDex:', error.message);

        if (error.response) {
            // MangaDex trả về lỗi (400, 404, 500...)
            console.error('Response data:', error.response.data);
            res.status(error.response.status).json({
                message: 'Lỗi khi gọi MangaDex API',
                error: error.response.data
            });

        } else if (error.request) {
            // Request gửi đi nhưng không có phản hồi
            console.error('Không nhận được phản hồi từ MangaDex:', error.request);
            res.status(500).json({
                message: 'Không nhận được phản hồi từ MangaDex',
                error: error.message
            });

        } else {
            // Lỗi bất ngờ (config sai, axios crash, v.v)
            console.error('Lỗi không xác định:', error.message);
            res.status(500).json({
                message: 'Lỗi không xác định khi gọi MangaDex API',
                error: error.message
            });
        }
    }
};
