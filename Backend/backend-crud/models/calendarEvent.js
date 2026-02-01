const mongoose = require('mongoose');

const calendarEventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: { type: String, enum: ['delivery', 'meeting', 'custom'], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date }, // Fecha de fin del evento
    description: { type: String }, // Descripción del evento
    location: { type: String }, // Ubicación del evento

    quotationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quotation', default: null },
    recipeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', default: null },

    status: { type: String, enum: ['pending', 'completed'], default: 'pending' },

    color: { type: String },
    icon: { type: String },

    // Sincronización con Google Calendar
    googleCalendar: {
        eventId: { type: String, default: null }, // ID del evento en Google Calendar
        isSynced: { type: Boolean, default: false }, // Si está sincronizado
        lastSyncedAt: { type: Date, default: null }, // Última sincronización
        syncError: { type: String, default: null } // Error de sincronización si existe
    }
}, { timestamps: true });

calendarEventSchema.index(
    { startDate: 1, quotationId: 1, type: 1 },
    { unique: true }
);

module.exports = mongoose.model('CalendarEvent', calendarEventSchema);
