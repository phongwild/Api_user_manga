const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    content: { type: String, required: true, trim: true, maxlength: 1000 },

    createdAt: { type: Date, default: Date.now, index: true },

    updatedAt: { type: Date, default: Date.now }

}, { _id: true });

const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    content: { type: String, required: true, trim: true, maxlength: 3000 },

    createdAt: { type: Date, default: Date.now, index: true },

    updatedAt: { type: Date, default: Date.now },

    replies: { type: [replySchema], default: [] }

}, { _id: true });

const mangaCommentsSchema = new mongoose.Schema({
    mangaId: { type: String, required: true, unique: true, index: true },

    comments: { type: [commentSchema], default: [] },

    commentsCount: { type: Number, default: 0 }

}, { timestamps: true });

mangaCommentsSchema.index({
    mangaId: 1,
    updatedAt: -1
});

commentSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

replySchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

const MangaComments = mongoose.model('MangaComments', mangaCommentsSchema);

module.exports = MangaComments;