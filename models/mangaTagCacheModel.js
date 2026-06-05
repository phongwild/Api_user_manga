const mongoose = require('mongoose');

const mangaTagCacheSchema = new mongoose.Schema({
    mangaId: { type: String, required: true, unique: true, index: true },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    tags: { type: [String], default: [], index: true },
    status: { type: String, default: 'unknown', index: true },
    year: { type: Number, index: true },
    originalLanguage: { type: String, default: '', index: true },
    followedCount: { type: Number, default: 0, index: true },
    rating: { type: Number, default: 0, index: true },
    contentRating: { type: String, default: '', index: true },
    coverFileName: { type: String, default: '' },
    lastChapter: { type: String, default: '' },
    updatedAt: { type: Date, default: Date.now, index: true }
});

module.exports = mongoose.model('MangaTagCache', mangaTagCacheSchema);