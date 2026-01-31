const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        googleId: { type: String, sparse: true, unique: true },
        email: { type: String, required: true, unique: true },
        password: { type: String },
        name: { type: String, required: true },
        picture: { type: String },
        role: { 
            type: String, 
            enum: ['client', 'chef'], 
            default: 'client',
            required: true 
        },
        isActive: { type: Boolean, default: true },
        lastLogin: { type: Date, default: Date.now }
    },
    {
        collection: 'users',
        timestamps: true
    }
);

// Validación: si no hay googleId, password es requerido
userSchema.pre('save', async function() {
    if (!this.googleId && !this.password) {
        throw new Error('Password is required for non-Google accounts');
    }
});

module.exports = mongoose.model('User', userSchema);
