const mongoose = require('mongoose');
const schema = mongoose.Schema;

const userSchema = new schema({
    username: {
        type: String,
        required: true,
        min: 6,
    },

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

    follow_list: [
        {
            type: String,
            required: true,
        },
    ],

    history: [
        {
            mangaId: {
                type: String,
                required: true,
            },
            createdAt: {
                type: Date,
                default: Date.now,
            }
        }
    ]

}, { timestamps: true });


module.exports = mongoose.model('User', userSchema);