const express = require('express');
const Recipe = require('../models/recipe');
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
        const recipes = await Recipe.find({ category: req.params.category });
        if (recipes.length === 0)
            return res.status(404).json({ message: 'No recipes found in this category' });

        res.json(recipes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/recipes/name/:name', async (req, res) => {
    try {
        const recipe = await Recipe.findOne({ name: req.params.name });
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
        if (!recipe)
            return res.status(404).json({ message: 'Recipe not found' });

        res.json(recipe);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/recipe', async (req, res) => {
    const recipe = new Recipe({
        name: req.body.name,
        servings: req.body.servings,
        description: req.body.description,
        ingredients: req.body.ingredients,
        instructions: req.body.instructions,
        costPerServing: req.body.costPerServing,
        pricePerServing: req.body.pricePerServing,
        category: req.body.category
    });

    try {
        const newRecipe = await recipe.save();
        res.status(201).json(newRecipe);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/recipe/:id', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe)
            return res.status(404).json({ message: 'Recipe not found' });

        Object.assign(recipe, req.body);

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
