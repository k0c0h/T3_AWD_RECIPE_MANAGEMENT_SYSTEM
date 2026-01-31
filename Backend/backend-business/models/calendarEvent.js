const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['delivery', 'meeting', 'custom'], required: true },
    startDate: { type: Date, required: true },

    quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', default: null },
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },

    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },

    color: { type: String },
    icon: { type: String }
}, { timestamps: true });

calendarEventSchema.index(
    { startDate: 1, quotationId: 1, type: 1 },
    { unique: true }
);

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
