const express = require('express');
const Recipe = require('../models/recipe');
const Ingredient = require('../models/ingredient');
const router = express.Router();

router.get('/recipes', async (req, res) => {
    try {
        const recipes = await Recipe.find({ isActive: true });
        res.json(recipes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/recipes/category/:category', async (req, res) => {
    try {
        const recipes = await Recipe.find({ category: req.params.category, isActive: true });
        if (recipes.length === 0)
            return res.status(404).json({ message: 'No recipes found in this category' });

        res.json(recipes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/recipes/name/:name', async (req, res) => {
    try {
        const recipe = await Recipe.findOne({ name: req.params.name, isActive: true });
        if (!recipe)
            return res.status(404).json({ message: 'Recipe not found' });

        res.json(recipe);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/recipes/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe || !recipe.isActive)
            return res.status(404).json({ message: 'Recipe not found' });

        res.json(recipe);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/recipe', async (req, res) => {
    try {
        const { name, servings, description, ingredients, instructions, category } = req.body;

        if (!ingredients || !servings) {
            return res.status(400).json({ message: 'Ingredients and servings are required' });
        }

        let totalCost = 0;

        // Calcular costo total basado en ingredientes y tamaño/price de cada ingrediente
        for (const ing of ingredients) {
            const ingredientData = await Ingredient.findOne({ productId: ing.productId });

            if (!ingredientData) {
                return res.status(400).json({
                    message: `Ingredient not found: ${ing.productId}`
                });
            }

            // Costo proporcional según cantidad usada y tamaño base
            const cost = (ing.quantity / ingredientData.size) * ingredientData.price;
            totalCost += cost;

            // Agregar referencia interna si quieres usarla
            ing.ingredientId = ingredientData._id;
        }

        const costPerServing = totalCost / servings;
        const pricePerServing = costPerServing * 2; // ejemplo margen del 100%

        const recipe = new Recipe({
            name,
            servings,
            description,
            ingredients,
            instructions,
            category,
            costPerServing,
            pricePerServing,
            isActive: true
        });

        const newRecipe = await recipe.save();
        res.status(201).json(newRecipe);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.put('/recipe/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe)
            return res.status(404).json({ message: 'Recipe not found' });

        const updates = req.body;

        // Si no mandan ingredientes o servings en el update, mantenemos los existentes
        const ingredients = updates.ingredients || recipe.ingredients;
        const servings = updates.servings || recipe.servings;

        let totalCost = 0;

        for (const ing of ingredients) {
            const ingredientData = await Ingredient.findOne({ productId: ing.productId });

            if (!ingredientData) {
                return res.status(400).json({
                    message: `Ingredient not found: ${ing.productId}`
                });
            }

            const cost = (ing.quantity / ingredientData.size) * ingredientData.price;
            totalCost += cost;

            ing.ingredientId = ingredientData._id;
        }

        updates.costPerServing = totalCost / servings;
        updates.pricePerServing = updates.costPerServing * 2;

        Object.assign(recipe, updates);

        const updatedRecipe = await recipe.save();
        res.json(updatedRecipe);

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/recipe/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe)
            return res.status(404).json({ message: 'Recipe not found' });

        recipe.isActive = false;
        recipe.deletedAt = new Date();

        await recipe.save();

        res.json({ message: 'Recipe deactivated successfully', recipe });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/recipe/:id/force', async (req, res) => {
    try {
        const recipe = await Recipe.findByIdAndDelete(req.params.id);
        if (!recipe)
            return res.status(404).json({ message: 'Recipe not found' });
        
        res.json({ message: 'Recipe permanently deleted', recipe });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.patch('/recipe/:id/restore', async (req, res) => {
    try {
        const recipe = await Recipe.findOne({ _id: req.params.id, isActive: false });
        if (!recipe)
            return res.status(404).json({ message: 'Deleted recipe not found' });

        recipe.isActive = true;
        recipe.deletedAt = null;

        await recipe.save();

        res.json({ message: 'Recipe restored successfully', recipe });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
