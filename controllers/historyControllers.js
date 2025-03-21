const User = require('../models/userModel');

module.exports.history = async (req, res) => {
    const { uid } = req.params;
    const { mangaId } = req.body;

    try {
        const user = await User.findById(uid);
        if (!user) {
            return res.status(400).json({ status: false, message: 'User not found' });
        }

        // Lấy thời gian hiện tại
        const now = new Date();

        // Kiểm tra xem manga đã có trong history chưa
        const existingEntry = user.history.find((item) => item.mangaId === mangaId);

        if (existingEntry) {
            return res.status(200).json({ status: true, alreadyExists: true, message: 'Manga is already in history' });
        }

        // Nếu chưa có thì thêm vào history
        user.history.push({ mangaId, addedAt: now });
        await user.save();

        res.status(200).json({ status: true, alreadyExists: false, message: 'Manga added to history' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};



module.exports.getList = async (req, res) => {
    const { uid } = req.params;
    const { offset = 1, limit = 10 } = req.query; // offset mặc định là 1 (trang 1)

    try {
        const user = await User.findById(uid);
        if (!user) {
            return res.status(400).json({ status: false, message: 'User not found' });
        }

        const page = Math.max(1, parseInt(offset)); // đảm bảo offset >= 1
        const pageSize = parseInt(limit);
        const start = (page - 1) * pageSize; // tính vị trí bắt đầu của trang
        const mangaList = user.history.slice(start, start + pageSize);

        res.status(200).json({
            status: true,
            data: mangaList,
            total: user.follow_list.length,
            currentPage: page,
            totalPages: Math.ceil(user.follow_list.length / pageSize),
            limit: pageSize
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};
