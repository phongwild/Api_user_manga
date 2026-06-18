const User = require('../models/userModel');
const { getMangasByIds } = require('../services/mangadex.service');

module.exports.history = async (req, res) => {
    const { uid } = req.params;
    const { mangaId } = req.body;

    try {
        // update thời gian nếu đã tồn tại
        const updated = await User.updateOne(
            {
                _id: uid,
                'history.mangaId': mangaId
            },
            {
                $set: {
                    'history.$.addedAt': new Date()
                }
            }
        );

        // nếu manga đã tồn tại
        if (updated.modifiedCount > 0) {
            return res.status(200).json({
                status: true,
                alreadyExists: true,
                message: 'History updated'
            });
        }

        // chưa tồn tại thì push mới
        await User.updateOne(
            { _id: uid },
            {
                $push: {
                    history: {
                        $each: [
                            {
                                mangaId,
                                addedAt: new Date()
                            }
                        ],
                        $position: 0,
                        $slice: 200
                    }
                }
            }
        );

        return res.status(200).json({
            status: true,
            alreadyExists: false,
            message: 'Manga added to history'
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

        const result = await User.aggregate([
            {
                $match: {
                    _id: uid
                }
            },
            {
                $project: {
                    total: {
                        $size: '$history'
                    },
                    history: {
                        $slice: ['$history', start, pageSize]
                    }
                }
            }
        ]);

        if (!result.length) {
            return res.status(404).json({
                status: false,
                message: 'User not found'
            });
        }
        const { history, total } = result[0];

        let mangas = [];

        if (history.length) {
            const mangaIds = history.map(item => item.mangaId);

            const response = await getMangasByIds(mangaIds);

            const mangaMap = new Map(
                response.map(manga => [manga.id, manga])
            );

            mangas = history
                .map(item => mangaMap.get(item.mangaId))
                .filter(Boolean);
        }

        return res.status(200).json({
            status: true,
            data: mangas,
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

module.exports.clearOldHistory = async (req, res) => {
    const { uid } = req.params;

    try {
        const sevenDaysAgo = new Date(
            Date.now() - 7 * 24 * 60 * 60 * 1000
        );

        const result = await User.updateOne(
            { _id: uid },
            {
                $pull: {
                    history: {
                        addedAt: {
                            $lt: sevenDaysAgo
                        }
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

        return res.status(200).json({
            status: true,
            message: 'Old history cleared successfully'
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
};

module.exports.removeHistory = async (req, res) => {
    const { uid } = req.params;
    const { mangaId } = req.body;

    try {
        const result = await User.updateOne(
            { _id: uid },
            {
                $pull: {
                    history: {
                        mangaId
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
            return res.status(404).json({
                status: false,
                message: 'History item not found'
            });
        }

        return res.status(200).json({
            status: true,
            message: 'History item removed successfully'
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Internal server error'
        });
    }
};