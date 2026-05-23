const User = require('../models/userModel');

module.exports.saveReadingProgress = async (req, res) => {
    const { uid } = req.params;

    const {
        mangaId,
        chapterId,
        chapterTitle,
        chapterNumber,
        page,
        completed = false,
    } = req.body;

    try {
        const user = await User.findById(uid);

        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'User not found',
            });
        }

        const existing = user.reading_progress.find(
            item => item.mangaId === mangaId
        );

        if (existing) {
            existing.chapterId = chapterId;
            existing.chapterTitle = chapterTitle;
            existing.chapterNumber = chapterNumber;
            existing.page = page;
            existing.completed = completed;
            existing.updatedAt = new Date();
        } else {
            user.reading_progress.push({
                mangaId,
                chapterId,
                chapterTitle,
                chapterNumber,
                page,
                completed,
                updatedAt: new Date(),
            });
        }

        user.reading_progress = user.reading_progress
            .sort(
                (a, b) =>
                    new Date(b.updatedAt) - new Date(a.updatedAt)
            )
            .slice(0, 300);

        await user.save();

        return res.status(200).json({
            status: true,
            message: 'Reading progress saved',
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Internal server error',
        });
    }
};


module.exports.getReadingProgress = async (req, res) => {
    const { uid, mangaId } = req.params;

    try {
        const user = await User.findById(uid);

        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'User not found',
            });
        }

        const progress = user.reading_progress.find(
            item => item.mangaId === mangaId
        );

        if (!progress) {
            return res.status(404).json({
                status: false,
                message: 'Progress not found',
            });
        }

        return res.status(200).json({
            status: true,
            data: progress,
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Internal server error',
        });
    }
};


module.exports.getAllReadingProgress = async (req, res) => {
    const { uid } = req.params;

    try {
        const user = await User.findById(uid);

        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'User not found',
            });
        }

        return res.status(200).json({
            status: true,
            data: user.reading_progress.sort(
                (a, b) =>
                    new Date(b.updatedAt) - new Date(a.updatedAt)
            ),
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Internal server error',
        });
    }
};


module.exports.removeReadingProgress = async (req, res) => {
    const { uid, mangaId } = req.params;

    try {
        const user = await User.findById(uid);

        if (!user) {
            return res.status(404).json({
                status: false,
                message: 'User not found',
            });
        }

        user.reading_progress = user.reading_progress.filter(
            item => item.mangaId !== mangaId
        );

        await user.save();

        return res.status(200).json({
            status: true,
            message: 'Reading progress removed',
        });
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: false,
            message: 'Internal server error',
        });
    }
};