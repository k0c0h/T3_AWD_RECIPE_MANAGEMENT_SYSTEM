const express = require('express');
const router = express.Router();
const recipeCrudController = require('../../controllers/recipeCrudController');

router.get('/recipes', recipeCrudController.getAllActiveRecipes);
router.get('/recipes/:id', recipeCrudController.getRecipeById);

module.exports = router;