const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        googleId: { type: String, required: true, unique: true },
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        picture: { type: String },
        isActive: { type: Boolean, default: true },
        lastLogin: { type: Date, default: Date.now }
    },
    {
        collection: 'users',
        timestamps: true
    }
);

module.exports = mongoose.model('User', userSchema);
