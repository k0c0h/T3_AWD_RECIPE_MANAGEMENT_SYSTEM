const CalendarEvent = require('../models/calendarEvent');
const Quotation = require('../models/quotation');


async function eventExists({ type, quotationId, startDate }) {
    return await CalendarEvent.findOne({ type, quotationId, startDate });
}


async function createCalendarEventForQuotation(quotation) {
    const exists = await eventExists({
        type: 'delivery',
        quotationId: quotation._id,
        startDate: quotation.deliveryDate
    });

    if (exists) return exists;

    return await CalendarEvent.create({
        title: `Entrega para ${quotation.clientName}`,
        type: 'delivery',
        startDate: quotation.deliveryDate,
        quotationId: quotation._id,
        color: '#1cc88a',
        icon: 'truck'
    });
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

async function createCustomCalendarEvent(data) {
    return await CalendarEvent.create(data);
}

exports.completeEvent = async (req, res) => {
    try {
        const updated = await CalendarEvent.findByIdAndUpdate(
            req.params.id,
            { status: 'completed' },
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: "Event not found" });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: "Error completing event", error: error.message });
    }
};

exports.getUpcomingEvents = async (req, res) => {
    try {
        const events = await CalendarEvent.find({
            startDate: { $gte: new Date() }
        }).sort({ startDate: 1 });

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: "Error fetching events", error: error.message });
    }
};

exports.getQuotationTimeline = async (req, res) => {
    try {
        const events = await CalendarEvent.find({
            quotationId: req.params.quotationId
        }).sort({ startDate: 1 });

        res.json(events);
    } catch (error) {
        res.status(500).json({ message: "Error fetching timeline", error: error.message });
    }
};

exports.createEventFromQuotation = async (req, res) => {
    try {
        const quotation = await Quotation.findById(req.params.id);
        if (!quotation) {
            return res.status(404).json({ message: "Quotation not found" });
        }

        const meetingDate = req.body.meetingDate || new Date();

        const event = await createClientMeetingEvent(quotation, meetingDate);

        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: "Error creating event", error: error.message });
    }
};

module.exports.createCalendarEventForQuotation = createCalendarEventForQuotation;
module.exports.createClientMeetingEvent = createClientMeetingEvent;
module.exports.createCustomCalendarEvent = createCustomCalendarEvent;
