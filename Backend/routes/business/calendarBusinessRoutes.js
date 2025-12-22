const express = require('express');
const router = express.Router();

const businessController = require('../../controllers/calendarBusinessController');
router.get('/calendar/events/upcoming', businessController.getUpcomingEvents);
router.patch('/calendar/events/:id/complete', businessController.completeEvent);
router.get('/calendar/timeline/:quotationId', businessController.getQuotationTimeline);
router.post('/calendar/events/create-from-quotation/:id', businessController.createEventFromQuotation);

module.exports = router;
