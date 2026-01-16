const express = require('express');
const router = express.Router();
const Quotation = require('../models/quotation');
const { createClientMeetingEvent } = require('../controllers/calendarBusinessController');

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
