const mongoose = require('mongoose');

const conversionSchema = new mongoose.Schema({
    value: {
        type: Number,
        required: true
    },

    fromUnit: {
        type: String,
        required: true
    },

    toUnit: {
        type: String,
        required: true
    },

    result: {
        type: Number,
        required: true
    },

    densityUsed: {
        type: Number,
        default: 1
    },

    ingredientId: {
        type: String
    },

    ingredientName: {
        type: String
    }
}, {
    collection: 'conversions',
    timestamps: true
});

module.exports = mongoose.model('Conversion', conversionSchema);
