const CalendarEvent = require('../models/calendarEvent');

exports.createEvent = async (req, res) => {
    try {
        const event = await CalendarEvent.create(req.body);
        res.status(201).json(event);
    } catch (e) {
        res.status(400).json({ message: "Error creating event", error: e.message });
    }
};

exports.getEvents = async (req, res) => {
    try {
        const events = await CalendarEvent.find().sort({ startDate: 1 });
        res.json(events);
    } catch (e) {
        res.status(500).json({ message: "Error fetching events", error: e.message });
    }
};

exports.getEventById = async (req, res) => {
    try {
        const event = await CalendarEvent.findById(req.params.id);
        if (!event) return res.status(404).json({ message: 'Event not found' });

        res.json(event);
    } catch (e) {
        res.status(400).json({ message: "Invalid ID", error: e.message });
    }
};

exports.updateEvent = async (req, res) => {
    try {
        const allowedFields = ["title", "startDate", "type", "color", "icon", "status"];
        const payload = {};

        for (const field of allowedFields) {
            if (req.body[field] !== undefined) payload[field] = req.body[field];
        }

        const updated = await CalendarEvent.findByIdAndUpdate(
            req.params.id,
            payload,
            { new: true }
        );

        if (!updated) return res.status(404).json({ message: "Event not found" });

        res.json(updated);
    } catch (e) {
        res.status(400).json({ message: "Error updating event", error: e.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const deleted = await CalendarEvent.findByIdAndDelete(req.params.id);

        if (!deleted) return res.status(404).json({ message: "Event not found" });

        res.json({ message: 'Event deleted', deleted });
    } catch (e) {
        res.status(400).json({ message: "Invalid ID", error: e.message });
    }
};

exports.getByQuotation = async (req, res) => {
    try {
        const events = await CalendarEvent.find({ quotationId: req.params.quotationId });
        res.json(events);
    } catch (e) {
        res.status(400).json({ message: "Error filtering events", error: e.message });
    }
};

exports.getByRecipe = async (req, res) => {
    try {
        const events = await CalendarEvent.find({ recipeId: req.params.recipeId });
        res.json(events);
    } catch (e) {
        res.status(400).json({ message: "Error filtering events", error: e.message });
    }
};
