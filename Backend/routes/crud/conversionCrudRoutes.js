const express = require('express');
const router = express.Router();
const controller = require('../../controllers/conversionCrudController');

router.get('/conversions', controller.getAll);
router.post('/conversion', controller.create);
router.patch('/conversion/:id', controller.update);
router.delete('/conversion/:id', controller.remove);

module.exports = router;
