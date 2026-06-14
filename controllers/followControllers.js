const User = require('../models/userModel');

module.exports.follow = async (req, res) => {
    const { uid } = req.params;
    const { mangaId } = req.body;

    try {
        const result = await User.updateOne(
            {
                _id: uid,
                follow_list: {
                    $ne: mangaId
                }
            },
            {
                $push: {
                    follow_list: {
                        $each: [mangaId],
                        $position: 0
                    }
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                status: false,
                message: 'User not found'
            });
        }

        if (result.modifiedCount === 0) {
            return res.status(200).json({
                status: true,
                alreadyFollowed: true,
                message: 'Manga is already in follow list'
            });
        }

        return res.status(200).json({
            status: true,
            alreadyFollowed: false,
            message: 'Manga added to follow list'
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
};

module.exports.remove_manga_from_follows = async (req, res) => {
    const { uid } = req.params;
    const { mangaId } = req.body;

    try {
        const result = await User.updateOne(
            {
                _id: uid,
                follow_list: mangaId
            },
            {
                $pull: {
                    follow_list: mangaId
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                status: false,
                message: 'User not found'
            });
        }

        if (result.modifiedCount === 0) {
            return res.status(200).json({
                status: true,
                alreadyRemoved: true,
                message: 'Manga is not in follow list'
            });
        }

        return res.status(200).json({
            status: true,
            alreadyRemoved: false,
            message: 'Manga removed from follow list'
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
};

module.exports.getList = async (req, res) => {
    const { offset = 1, limit = 10 } = req.query;
    const uid = req.user._id;
    try {
        const page = Math.max(1, parseInt(offset) || 1);
        const pageSize = Math.max(1, parseInt(limit) || 10);
        const start = (page - 1) * pageSize;

        const user = await User.findById(
            uid,
            {
                follow_list: {
                    $slice: [start, pageSize]
                }
            }
        ).lean();

        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'User not found'
            });
        }

        const totalUser = await User.findById(uid)
            .select('follow_list')
            .lean();

        const total = totalUser.follow_list.length;

        return res.status(200).json({
            status: true,
            data: user.follow_list,
            total,
            currentPage: page,
            totalPages: Math.ceil(total / pageSize),
            limit: pageSize
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
};

module.exports.check_follow = async (req, res) => {
    const { uid } = req.params;
    const { mangaId } = req.query;

    try {
        const exists = await User.exists({
            _id: uid,
            follow_list: mangaId
        });

        return res.status(200).json({
            status: true,
            isFollowing: !!exists
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
};