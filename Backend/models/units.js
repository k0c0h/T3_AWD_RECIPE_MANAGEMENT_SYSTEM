const mongoose = require('mongoose');

const unitSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
        // g, kg, ml, cup, tbsp...
    },

    type: {
        type: String,
        enum: ['weight', 'volume'],
        required: true
    },

    toBase: {
        type: Number,
        required: true
    },

    isActive: {
        type: Boolean,
        default: true
    }
}, {
    collection: 'units',
    timestamps: true
});

module.exports = mongoose.model('Units', unitSchema);
