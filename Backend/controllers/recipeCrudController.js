const Recipe = require('../models/recipe');

exports.getAllActiveRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({ isActive: true });
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe || !recipe.isActive) {
      return res.status(404).json({ message: 'Recipe not found' });
    }
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const updates = req.body;

    const ingredients = updates.ingredients || recipe.ingredients;
    const servings = updates.servings || recipe.servings;

    const recipeBusiness = require('../business/recipeBusiness');
    const { updatedIngredients, costPerServing, pricePerServing } = await recipeBusiness.calculateCosts(ingredients, servings);

    updates.ingredients = updatedIngredients;
    updates.costPerServing = costPerServing;
    updates.pricePerServing = pricePerServing;

    if (req.file) {
      updates.imageUrl = `/uploads/recipes/${req.file.filename}`;
    }
    
    Object.assign(recipe, updates);

    const updatedRecipe = await recipe.save();
    res.json(updatedRecipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deactivateRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    recipe.isActive = false;
    recipe.deletedAt = new Date();

    await recipe.save();

    res.json({ message: 'Recipe deactivated successfully', recipe });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteRecipePermanently = async (req, res) => {
  try {
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ message: 'Recipe not found' });

    res.json({ message: 'Recipe permanently deleted', recipe });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.restoreRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findOne({ _id: req.params.id, isActive: false });
    if (!recipe) return res.status(404).json({ message: 'Deleted recipe not found' });

    recipe.isActive = true;
    recipe.deletedAt = null;

    await recipe.save();

    res.json({ message: 'Recipe restored successfully', recipe });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
