const Recipe = require('../models/recipe');
const recipeLogic = require('./recipeLogic');

// POST - Crear receta CRUD PURO (sin cálculos automáticos)
// Para calcular costos, usar POST /recipe/:id/calculate-costs
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

    const imageUrl = req.file
      ? `/uploads/recipes/${req.file.filename}`
      : null;

    const recipe = new Recipe({
      name,
      servings,
      description,
      ingredients,
      instructions, 
      category,
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

// POST - Calcular y actualizar costos de una receta (BUSINESS LOGIC)
exports.calculateRecipeCosts = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const { updatedIngredients, costPerServing, pricePerServing } =
      await recipeLogic.calculateCosts(recipe.ingredients, recipe.servings);

    recipe.ingredients = updatedIngredients;
    recipe.costPerServing = costPerServing;
    recipe.pricePerServing = pricePerServing;

    const updatedRecipe = await recipe.save();
    res.json(updatedRecipe);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// PUT - Recalcular costos cuando cambian ingredientes o servings (BUSINESS LOGIC)
exports.recalculateRecipeCosts = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const ingredients = req.body.ingredients || recipe.ingredients;
    const servings = req.body.servings || recipe.servings;

    const { updatedIngredients, costPerServing, pricePerServing } =
      await recipeLogic.calculateCosts(ingredients, servings);

    recipe.ingredients = updatedIngredients;
    recipe.servings = servings;
    recipe.costPerServing = costPerServing;
    recipe.pricePerServing = pricePerServing;

    const updatedRecipe = await recipe.save();
    res.json(updatedRecipe);

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