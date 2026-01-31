const Recipe = require('../models/recipe');
const recipeLogic = require('./recipeLogic');

exports.createRecipe = async (req, res) => {
  try {
    let {
      name,
      servings,
      description,
      ingredients,
      instructions,
      category,
    } = req.body;

    if (typeof ingredients === "string") {
      ingredients = JSON.parse(ingredients);
    }

    if (typeof instructions === "string") {
      instructions = JSON.parse(instructions);
    }

    if (!ingredients || ingredients.length === 0 || !servings) {
      return res.status(400).json({
        message: "Ingredients and servings are required",
      });
    }

    const { updatedIngredients, costPerServing, pricePerServing } =
      await recipeLogic.calculateCosts(ingredients, servings);

    const imageUrl = req.file
      ? `/uploads/recipes/${req.file.filename}`
      : null;

    const recipe = new Recipe({
      name,
      servings,
      description,
      ingredients: updatedIngredients,
      instructions, 
      category,
      costPerServing,
      pricePerServing,
      imageUrl,
      isActive: true,
    });

    const newRecipe = await recipe.save();
    res.status(201).json(newRecipe);

  } catch (err) {
    console.error(err);
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