const MangaComments = require('../models/commentModel');

exports.getCommentsByManga = async (req, res) => {
    try {
        const { mangaId } = req.params;

        const mangaComments = await MangaComments.findOne({ mangaId })
            .populate({
                path: 'comments.userId',
                select: 'username avatar', // Chỉ lấy trường username và avatar
            })
            .populate({
                path: 'comments.replies.userId',
                select: 'username avatar', // Reply cũng lấy thông tin user
            });

        if (!mangaComments) {
            return res.status(404).json({
                status: false,
                message: 'No comments found for this manga'
            });
        }

        res.status(200).json({
            status: true,
            message: 'Get comments successfully',
            data: mangaComments.comments
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Get comments failed',
            error: error.message
        });
    }
};


exports.addComment = async (req, res) => {
    try {
        const { mangaId } = req.params; // MangaDex ID
        const { userId, content } = req.body; // User ID và nội dung bình luận

        // Kiểm tra xem manga đã có trong cơ sở dữ liệu chưa
        let mangaComments = await MangaComments.findOne({ mangaId });

        let newComment;

        if (!mangaComments) {
            // Nếu không có, tạo mới bản ghi cho manga với comment đầu tiên
            newComment = { userId, content };
            mangaComments = new MangaComments({
                mangaId,
                comments: [newComment]
            });
        } else {
            // Nếu đã có, thêm bình luận vào danh sách comments
            newComment = { userId, content };
            mangaComments.comments.push(newComment);
        }

        await mangaComments.save();

        // Lấy comment vừa thêm (ở cuối danh sách)
        const addedComment = mangaComments.comments[mangaComments.comments.length - 1];

        res.status(201).json({
            status: true,
            message: 'Add comment successfully',
            data: addedComment
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Add comment failed',
            error: error.message
        });
    }
};


exports.editComment = async (req, res) => {
    try {
        const { mangaId, commentId } = req.params; // ID manga và ID bình luận cần sửa
        const { content } = req.body; // Nội dung mới

        const mangaComments = await MangaComments.findOne({ mangaId });

        if (!mangaComments) {
            return res.status(404).json({
                status: false,
                message: 'Manga not found'
            });
        }

        // Tìm bình luận cần sửa
        const comment = mangaComments.comments.id(commentId);

        if (!comment) {
            return res.status(404).json({
                status: false,
                message: 'Comment not found'
            });
        }

        // Cập nhật nội dung bình luận
        comment.content = content;
        await mangaComments.save();

        res.status(200).json({
            status: true,
            message: 'Comment updated successfully',
            data: comment
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Failed to update comment',
            error: error.message
        });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const { mangaId, commentId } = req.params; // ID manga và ID bình luận cần xóa

        const mangaComments = await MangaComments.findOne({ mangaId });

        if (!mangaComments) {
            return res.status(404).json({
                status: false,
                message: 'Manga not found'
            });
        }

        // Tìm comment bằng id (chắc chắn commentId là ObjectId)
        const commentIndex = mangaComments.comments.findIndex(comment => comment._id.toString() === commentId);

        if (commentIndex === -1) {
            return res.status(404).json({
                status: false,
                message: 'Comment not found'
            });
        }

        // Xóa bình luận
        mangaComments.comments.splice(commentIndex, 1);

        await mangaComments.save();

        res.status(200).json({
            status: true,
            message: 'Comment deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
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

        // Kiểm tra dữ liệu đầu vào
        if (!userId || !content) {
            return res.status(400).json({
                status: false,
                message: 'Missing userId or content'
            });
        }

        const mangaComments = await MangaComments.findOne({ mangaId });

        if (!mangaComments) {
            return res.status(404).json({
                status: false,
                message: 'Manga not found'
            });
        }

        // Tìm bình luận mẹ
        const comment = mangaComments.comments.id(commentId);

        if (!comment) {
            return res.status(404).json({
                status: false,
                message: 'Comment not found'
            });
        }

        // Thêm reply mới
        comment.replies.push({ userId, content });
        await mangaComments.save();

        // Lấy reply vừa thêm
        const newReply = comment.replies[comment.replies.length - 1];

        res.status(201).json({
            status: true,
            message: 'Reply added successfully',
            data: newReply
        });
    } catch (error) {
        res.status(500).json({
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

        if (!content) {
            return res.status(400).json({
                status: false,
                message: 'Missing content to update'
            });
        }

        const mangaComments = await MangaComments.findOne({ mangaId });
        if (!mangaComments) {
            return res.status(404).json({
                status: false,
                message: 'Manga not found'
            });
        }

        const comment = mangaComments.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({
                status: false,
                message: 'Comment not found'
            });
        }

        const reply = comment.replies.id(replyId);
        if (!reply) {
            return res.status(404).json({
                status: false,
                message: 'Reply not found'
            });
        }

        reply.content = content;
        await mangaComments.save();

        res.status(200).json({
            status: true,
            message: 'Reply updated successfully',
            data: reply
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Failed to update reply',
            error: error.message
        });
    }
};

exports.deleteReply = async (req, res) => {
    try {
        const { mangaId, commentId, replyId } = req.params;

        const mangaComments = await MangaComments.findOne({ mangaId });
        if (!mangaComments) {
            return res.status(404).json({
                status: false,
                message: 'Manga not found'
            });
        }

        const comment = mangaComments.comments.id(commentId);
        if (!comment) {
            return res.status(404).json({
                status: false,
                message: 'Comment not found'
            });
        }

        // Tìm reply trong mảng replies của comment
        const replyIndex = comment.replies.findIndex(reply => reply._id.toString() === replyId);
        if (replyIndex === -1) {
            return res.status(404).json({
                status: false,
                message: 'Reply not found'
            });
        }

        // Xóa reply
        comment.replies.splice(replyIndex, 1);

        await mangaComments.save();

        res.status(200).json({
            status: true,
            message: 'Reply deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            status: false,
            message: 'Failed to delete reply',
            error: error.message
        });
    }
};


