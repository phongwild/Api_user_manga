const MangaComments = require('../models/commentModel');

exports.getCommentsByManga = async (req, res) => {
    try {
        const { mangaId } = req.params;

        const mangaComments = await MangaComments.findOne({ mangaId })
            .select('comments commentsCount')
            .populate('comments.userId', 'username avatar')
            .populate('comments.replies.userId', 'username avatar')
            .lean();

        if (!mangaComments) {
            return res.status(404).json({
                status: false,
                message: 'No comments found for this manga'
            });
        }

        mangaComments.comments.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );

        return res.status(200).json({
            status: true,
            message: 'Get comments successfully',
            total: mangaComments.commentsCount,
            data: mangaComments.comments
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Get comments failed',
            error: error.message
        });
    }
};

exports.addComment = async (req, res) => {
    try {
        const { mangaId } = req.params;
        const { userId, content } = req.body;

        if (!userId || !content?.trim()) {
            return res.status(400).json({
                status: false,
                message: 'Missing userId or content'
            });
        }

        const newComment = {
            userId,
            content: content.trim(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const mangaComments = await MangaComments.findOneAndUpdate(
            { mangaId },
            {
                $push: { comments: newComment },
                $inc: { commentsCount: 1 },
            },
            {
                upsert: true,
                new: true,
            }
        );

        return res.status(201).json({
            status: true,
            message: 'Add comment successfully',
            data: mangaComments.comments[mangaComments.comments.length - 1]
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Add comment failed',
            error: error.message
        });
    }
};

exports.editComment = async (req, res) => {
    try {
        const { mangaId, commentId } = req.params;
        const { content } = req.body;

        const result = await MangaComments.updateOne(
            {
                mangaId,
                'comments._id': commentId
            },
            {
                $set: {
                    'comments.$.content': content.trim(),
                    'comments.$.updatedAt': new Date(),
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                status: false,
                message: 'Comment not found'
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Comment updated successfully'
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Failed to update comment',
            error: error.message
        });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const { mangaId, commentId } = req.params;

        const result = await MangaComments.updateOne(
            { mangaId },
            {
                $pull: {
                    comments: { _id: commentId }
                },
                $inc: {
                    commentsCount: -1
                }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({
                status: false,
                message: 'Comment not found'
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Comment deleted successfully'
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Failed to delete comment',
            error: error.message
        });
    }
};

exports.replyComment = async (req, res) => {
    try {
        const { mangaId, commentId } = req.params;
        const { userId, content } = req.body;

        if (!userId || !content?.trim()) {
            return res.status(400).json({
                status: false,
                message: 'Missing userId or content'
            });
        }

        const newReply = {
            userId,
            content: content.trim(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await MangaComments.updateOne(
            {
                mangaId,
                'comments._id': commentId
            },
            {
                $push: {
                    'comments.$.replies': newReply
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({
                status: false,
                message: 'Comment not found'
            });
        }

        return res.status(201).json({
            status: true,
            message: 'Reply added successfully'
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Failed to add reply',
            error: error.message
        });
    }
};

exports.editReply = async (req, res) => {
    try {
        const { mangaId, commentId, replyId } = req.params;
        const { content } = req.body;

        const result = await MangaComments.updateOne(
            {
                mangaId,
                'comments._id': commentId,
                'comments.replies._id': replyId
            },
            {
                $set: {
                    'comments.$[comment].replies.$[reply].content': content.trim(),
                    'comments.$[comment].replies.$[reply].updatedAt': new Date(),
                }
            },
            {
                arrayFilters: [
                    { 'comment._id': commentId },
                    { 'reply._id': replyId }
                ]
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({
                status: false,
                message: 'Reply not found'
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Reply updated successfully'
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Failed to update reply',
            error: error.message
        });
    }
};

exports.deleteReply = async (req, res) => {
    try {
        const { mangaId, commentId, replyId } = req.params;

        const result = await MangaComments.updateOne(
            {
                mangaId,
                'comments._id': commentId
            },
            {
                $pull: {
                    'comments.$.replies': {
                        _id: replyId
                    }
                }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({
                status: false,
                message: 'Reply not found'
            });
        }

        return res.status(200).json({
            status: true,
            message: 'Reply deleted successfully'
        });

    } catch (error) {
        return res.status(500).json({
            status: false,
            message: 'Failed to delete reply',
            error: error.message
        });
    }
};