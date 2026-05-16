const mongoose = require('mongoose');
const schema = mongoose.Schema;

const userSchema = new schema({
    googleId: { type: String },
    username: {
        type: String,
        required: true,
        min: 6,
    },
    avatar: { type: String },
    email: {
        type: String,
        required: true,
        unique: true,
        min: 6,
        max: 255,
    },

    password: {
        type: String,
        required: true,
        min: 8,
    },

    follow_list: {
        type: [String],
        default: [],
    },

    history: {
        type: [
            {
                mangaId: String,
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        default: [],
    },

}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);