const Recipe = require('../models/recipe');
const axios = require('axios');
const BUSINESS_API = process.env.BUSINESS_API_URL || 'http://localhost:3008/dishdash';

exports.createRecipe = async (req, res) => {
  try {

    let { name, servings, description, ingredients, instructions, category, costPerServing = 0, pricePerServing = 0 } = req.body;

    if (typeof ingredients === 'string') ingredients = JSON.parse(ingredients);
    if (typeof instructions === 'string') instructions = JSON.parse(instructions);

    const recipe = new Recipe({
      name,
      servings,
      description,
      ingredients,
      instructions,
      category,
      costPerServing,
      pricePerServing,
      isActive: true,
      imageUrl: req.file ? `/uploads/recipes/${req.file.filename}` : null
    });

    const saved = await recipe.save();

    try {
      const authHeader = req.headers['authorization'];
      const url = `${BUSINESS_API}/recipes/${encodeURIComponent(saved._id)}/calculate-costs`;
      console.log(`Triggering business calc: ${url}`);
      await axios.post(url, {}, { headers: { Authorization: authHeader } });
      const updated = await Recipe.findById(saved._id);
      return res.status(201).json(updated);
    } catch (businessErr) {
      console.error('Business calculation failed:', businessErr.response ? businessErr.response.data : businessErr.message);
      return res.status(201).json({ message: 'Recipe created but cost calculation failed', recipe: saved, calculationError: businessErr.response ? businessErr.response.data : businessErr.message });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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

    let updates = { ...req.body };

    // 🔹 IMPORTANTE: multipart/form-data → todo llega como string
    if (typeof updates.ingredients === 'string') {
      updates.ingredients = JSON.parse(updates.ingredients);
    }

    if (typeof updates.instructions === 'string') {
      updates.instructions = JSON.parse(updates.instructions);
    }

    if (req.file) {
      updates.imageUrl = `/uploads/recipes/${req.file.filename}`;
    }

    Object.assign(recipe, updates);

    const updatedRecipe = await recipe.save();

    try {
      await axios.put(
        `${BUSINESS_API}/recipes/${updatedRecipe._id}/recalculate-costs`,
        {
          ingredients: updatedRecipe.ingredients,
          servings: updatedRecipe.servings
        },
        {
          headers: { Authorization: req.headers.authorization }
        }
      );
    } catch (businessErr) {
      console.error(
        'Recalculation failed:',
        businessErr.response?.data || businessErr.message
      );
    }

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
