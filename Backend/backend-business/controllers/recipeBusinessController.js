const Recipe = require('../models/recipe');
const recipeLogic = require('./recipeLogic');

exports.calculateRecipeCosts = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    console.log(`calculateRecipeCosts: processing recipe ${req.params.id}`);

    const { updatedIngredients, costPerServing, pricePerServing } =
      await recipeLogic.calculateCosts(recipe.ingredients, recipe.servings);

    recipe.ingredients = updatedIngredients;
    recipe.costPerServing = costPerServing;
    recipe.pricePerServing = pricePerServing;

    const updatedRecipe = await recipe.save();
    res.json(updatedRecipe);

  } catch (err) {
    console.error('Error in calculateRecipeCosts:', err);
    if (err.message && err.message.startsWith('Ingredient not found')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.recalculateRecipeCosts = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const ingredients = req.body.ingredients || recipe.ingredients;
    const servings = req.body.servings || recipe.servings;

    console.log(`recalculateRecipeCosts: recipe ${req.params.id} with servings ${servings}`);

    const { updatedIngredients, costPerServing, pricePerServing } =
      await recipeLogic.calculateCosts(ingredients, servings);

    recipe.ingredients = updatedIngredients;
    recipe.servings = servings;
    recipe.costPerServing = costPerServing;
    recipe.pricePerServing = pricePerServing;

    const updatedRecipe = await recipe.save();
    console.log(`recalculateRecipeCosts: success for recipe ${req.params.id} - costPerServing=${costPerServing}`);
    res.json(updatedRecipe);

  } catch (err) {
    console.error('Error in recalculateRecipeCosts:', err);
    if (err.message && err.message.startsWith('Ingredient not found')) {
      return res.status(400).json({ message: err.message });
    }
    res.status(500).json({ message: err.message });
  }
};

exports.getRecipesByCategory = async (req, res) => {
  try {
    const recipes = await Recipe.find({ category: req.params.category, isActive: true });
    if (recipes.length === 0) {
      return res.status(404).json({ message: 'No recipes found in this category' });
    }
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRecipeByName = async (req, res) => {
  try {
    const recipe = await Recipe.find({ 
      name: { $regex: req.params.name, $options: 'i' }, 
      isActive: true 
    });
    if (!recipe || recipe.length === 0) return res.status(404).json({ message: 'Recipe not found' });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};