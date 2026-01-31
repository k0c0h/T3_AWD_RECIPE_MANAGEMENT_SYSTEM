const express = require('express');
const router = express.Router();

const businessController = require('../../controllers/calendarBusinessController');
router.post('/calendar/events/create-from-quotation/:id', businessController.createEventFromQuotation);

module.exports = router;
