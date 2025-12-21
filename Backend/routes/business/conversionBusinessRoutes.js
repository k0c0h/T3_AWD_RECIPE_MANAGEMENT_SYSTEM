const express = require('express');
const router = express.Router();
const controller = require('../../controllers/conversionBusinessController');

router.post('/conversion', controller.convertAndSave);
router.post('/conversion/kitchen', controller.kitchenConversion);

module.exports = router;
