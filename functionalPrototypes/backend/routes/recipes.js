const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');

// GET - Obtener todas las recetas
router.get('/', async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - Obtener una receta por ID
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Receta no encontrada' });
    }
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - Crear nueva receta
router.post('/', async (req, res) => {
  const recipe = new Recipe({
    name: req.body.name,
    type: req.body.type,
    costPerServing: req.body.costPerServing,
    pricePerServing: req.body.pricePerServing
  });

  try {
    const newRecipe = await recipe.save();
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT - Actualizar receta
router.put('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Receta no encontrada' });
    }

    if (req.body.name != null) recipe.name = req.body.name;
    if (req.body.type != null) recipe.type = req.body.type;
    if (req.body.costPerServing != null) recipe.costPerServing = req.body.costPerServing;
    if (req.body.pricePerServing != null) recipe.pricePerServing = req.body.pricePerServing;

    const updatedRecipe = await recipe.save();
    res.json(updatedRecipe);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE - Eliminar receta
router.delete('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) {
      return res.status(404).json({ message: 'Receta no encontrada' });
    }

    await recipe.deleteOne();
    res.json({ message: 'Receta eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
