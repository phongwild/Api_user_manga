const User = require('../models/userModel');

module.exports.follow = async (req, res) => {
    const { uid } = req.params;
    const { mangaId } = req.body;

    try {
        const user = await User.findById(uid);
        if (!user) {
            return res.status(400).json({ status: false, message: 'User not found' });
        }

        if (user.follow_list.includes(mangaId)) {
            return res.status(200).json({ status: true, alreadyFollowed: true, message: 'Manga is already in follow list' });
        }

        user.follow_list.push(mangaId);
        await user.save();

        res.status(200).json({ status: true, alreadyFollowed: false, message: 'Manga added to follow list' });
    } catch (error) {
        res.status(500).json({ status: false, message: 'Internal server error' });
    }
};



module.exports.remove_manga_from_follows = async (req, res) => {
    const { uid } = req.params;
    const { mangaId } = req.body;

    try {
        const user = await User.findById(uid);
        if (!user) {
            return res.status(400).json({ status: false, message: 'User not found' });
        }

        // Kiểm tra nếu manga không có trong danh sách follow
        if (!user.follow_list.includes(mangaId)) {
            return res.status(200).json({ status: true, alreadyRemoved: true, message: 'Manga is not in follow list' });
        }

        // Xóa manga khỏi danh sách follow
        user.follow_list = user.follow_list.filter(id => id !== mangaId);
        await user.save();

        res.status(200).json({ status: true, alreadyRemoved: false, message: 'Manga removed from follow list' });
    } catch (error) {
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
        const mangaList = user.follow_list.slice(start, start + pageSize);

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
