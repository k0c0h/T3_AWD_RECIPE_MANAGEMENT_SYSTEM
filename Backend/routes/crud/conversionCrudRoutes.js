const express = require('express');
const router = express.Router();
const controller = require('../../controllers/conversionCrudController');

router.get('/conversions', controller.getAll);
router.post('/conversions', controller.create);
router.patch('/conversions/:id', controller.update);
router.delete('/conversions/:id', controller.remove);

module.exports = router;
