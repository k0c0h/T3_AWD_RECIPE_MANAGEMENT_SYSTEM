const express = require('express');
const router = express.Router();

const scaledRecipeBusinessController = require('../../controllers/scaledRecipeBusinessController');

router.post('/recipe/:id/scale', scaledRecipeBusinessController.scaleRecipe);

module.exports = router;
