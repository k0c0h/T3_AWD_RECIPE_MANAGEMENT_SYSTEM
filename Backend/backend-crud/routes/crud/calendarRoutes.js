const express = require('express');
const router = express.Router();
const Quotation = require('../../models/quotation');
const CalendarEvent = require('../../models/calendarEvent');

async function eventExists({ type, quotationId, startDate }) {
    return await CalendarEvent.findOne({ type, quotationId, startDate });
}

async function createClientMeetingEvent(quotation, meetingDate) {
    const exists = await eventExists({
        type: 'meeting',
        quotationId: quotation._id,
        startDate: meetingDate
    });

    if (exists) return exists;

    return await CalendarEvent.create({
        title: `Reunión con ${quotation.clientName}`,
        type: 'meeting',
        startDate: meetingDate,
        quotationId: quotation._id,
        color: '#36b9cc',
        icon: 'calendar'
    });
}

router.post('/calendar/meeting', async (req, res) => {
    try {
        const { quotationId, meetingDate } = req.body;

        const quotation = await Quotation.findById(quotationId);
        if (!quotation)
            return res.status(404).json({ message: 'Quotation not found' });

        const event = await createClientMeetingEvent(quotation, meetingDate);

        res.status(201).json(event);

    } catch (error) {
        res.status(500).json({
            message: 'Error creating meeting event',
            error: error.message
        });
    }
});

module.exports = router;
