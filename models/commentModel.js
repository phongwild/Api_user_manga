const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
}, { _id: true });

const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    replies: [replySchema] // Danh sách các reply cho bình luận này
}, { _id: true });

const mangaCommentsSchema = new mongoose.Schema({
    mangaId: { type: String, required: true, unique: true },
    comments: [commentSchema]
});

const MangaComments = mongoose.model('MangaComments', mangaCommentsSchema);

module.exports = MangaComments;
