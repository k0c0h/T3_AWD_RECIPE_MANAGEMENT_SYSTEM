const express = require('express');
const router = express.Router();

const businessController = require('../../controllers/calendarBusinessController');
const CalendarEvent = require('../../models/calendarEvent');

router.post('/calendar/events/create-from-quotation/:id', businessController.createEventFromQuotation);

// POST - Resincronizar evento específico con Google Calendar
router.post('/calendar/events/:id/sync-google', async (req, res) => {
    try {
        const event = await CalendarEvent.findById(req.params.id).populate('quotationId');
        if (!event) return res.status(404).json({ message: 'Event not found' });

        const quotation = event.quotationId;
        if (!quotation || !quotation.chefId) {
            return res.status(400).json({ message: 'Quotation or chef not found' });
        }

        const calendar = await businessController.getGoogleCalendarClient(quotation.chefId);
        if (!calendar) {
            return res.status(400).json({ message: 'Chef does not have Google Calendar linked' });
        }

        // Si ya existe en Google, actualizar; si no, crear
        if (event.googleCalendar?.eventId) {
            await businessController.updateGoogleCalendarEvent(calendar, event.googleCalendar.eventId, event);
            event.googleCalendar.lastSyncedAt = new Date();
            event.googleCalendar.syncError = null;
        } else {
            const googleEventId = await businessController.createGoogleCalendarEvent(calendar, event);
            event.googleCalendar = {
                eventId: googleEventId,
                isSynced: true,
                lastSyncedAt: new Date(),
                syncError: null
            };
        }

        await event.save();
        res.json({ message: 'Event synced successfully', event });
    } catch (error) {
        res.status(500).json({ message: 'Error syncing event', error: error.message });
    }
});

// DELETE - Eliminar evento de Google Calendar
router.delete('/calendar/events/:id/google', async (req, res) => {
    try {
        const event = await CalendarEvent.findById(req.params.id).populate('quotationId');
        if (!event) return res.status(404).json({ message: 'Event not found' });

        if (!event.googleCalendar?.eventId) {
            return res.status(400).json({ message: 'Event not synced with Google Calendar' });
        }

        const quotation = event.quotationId;
        const calendar = await businessController.getGoogleCalendarClient(quotation.chefId);
        
        if (calendar) {
            await businessController.deleteGoogleCalendarEvent(calendar, event.googleCalendar.eventId);
        }

        event.googleCalendar = {
            eventId: null,
            isSynced: false,
            lastSyncedAt: new Date(),
            syncError: null
        };
        await event.save();

        res.json({ message: 'Event removed from Google Calendar' });
    } catch (error) {
        res.status(500).json({ message: 'Error removing event from Google', error: error.message });
    }
});

module.exports = router;
