const axios = require('axios');
const fs = require('fs');
require('dotenv').config();
const params = new URLSearchParams();

exports.uploadImg = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Không có file được gửi lên.' });
        }

        const filePath = req.file.path;
        const fileData = fs.readFileSync(filePath, { encoding: 'base64' });
        const requestUrl = `https://api.imgbb.com/1/upload?key=${process.env.ImgBB_API_KEY}`;

        params.append('image', fileData);

        const response = await axios.post(requestUrl, params, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        fs.unlinkSync(filePath);

        if (response.status === 200) {
            res.status(200).json({
                success: true,
                message: 'Upload thành công',
                data: response.data.data.url,
                display_url: response.data.data.display_url,
            });
        } else {
            res.status(response.status).json({ success: false, message: 'Upload thất bại' });
        }
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ success: false, message: error.message });
    }
};
