const express = require('express');
const router = express.Router();

const calendarController = require('../../controllers/calendarCrudController');

// Filtros por quotation o recipe (antes de la ruta genérica :id)
router.get('/calendar/events/quotation/:quotationId', calendarController.getByQuotation);
router.get('/calendar/events/recipe/:recipeId', calendarController.getByRecipe);

// CRUD
router.post('/calendar/events', calendarController.createEvent);
router.get('/calendar/events', calendarController.getEvents);
router.get('/calendar/events/:id', calendarController.getEventById);
router.put('/calendar/events/:id', calendarController.updateEvent);
router.delete('/calendar/events/:id', calendarController.deleteEvent);

module.exports = router;
