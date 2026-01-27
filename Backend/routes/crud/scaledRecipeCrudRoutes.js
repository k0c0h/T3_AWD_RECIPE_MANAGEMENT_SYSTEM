const express = require('express');
const router = express.Router();

const scaledRecipeController = require('../../controllers/scaledRecipeCrudController');

router.get('/scaled-recipes', scaledRecipeController.getScaledRecipes);
router.get('/scaled-recipes/recipe/:recipeId', scaledRecipeController.getScaledRecipesByRecipeId);
router.get('/scaled-recipes/:id', scaledRecipeController.getScaledRecipeById);
router.delete('/scaled-recipes/:id', scaledRecipeController.deleteScaledRecipe);

module.exports = router;
