const express = require('express');
const Ingredient = require('../models/ingredient'); 
const router = express.Router();

router.get('/ingredients', async(req, res) => { 
    try {
        const ingredients = await Ingredient.find(); 
        res.json(ingredients);
    } catch(err) {
        res.status(500).json({message: err.message});
    }
});

router.get('/ingredients/category/:category', async (req, res) => { 
    try {
        const ingredients = await Ingredient.find({category: req.params.category}); 
        if (ingredients.length === 0) {
            res.status(404).json({message: 'No ingredients found in this category'});
        } else {
            res.json(ingredients);
        }
    } catch (err) {
        res.status(500).json({message: err.message});
    }  
});

router.get('/ingredients/:productId', async (req, res) => {
    try {
        const ingredient = await Ingredient.findOne({productId: req.params.productId});
        if (ingredient == null) {
            res.status(404).json({message: 'Ingredient not found'});
        } else {
            res.json(ingredient);
        }
    } catch(err) {
        res.status(500).json({message: err.message});
    }
});

router.get('/ingredients/name/:name', async (req, res) => {
    try {
        const ingredient = await Ingredient.findOne({name: req.params.name});
        if (ingredient == null) {
            res.status(404).json({message: 'Ingredient not found'});
        } else {
            res.json(ingredient);
        }
    } catch(err) {
        res.status(500).json({message: err.message});
    }
});

router.post('/ingredient', async (req, res) => {
    const ingredientObject = new Ingredient({ 
        productId: req.body.productId,
        name: req.body.name,
        category: req.body.category,
        product: req.body.product,
        brand: req.body.brand,
        size: req.body.size,
        sizeUnit: req.body.sizeUnit,
        price: req.body.price,
        availableUnits: req.body.availableUnits,
        supplier: req.body.supplier
    });

    try {
        const newIngredient = await ingredientObject.save();
        res.status(201).json(newIngredient); 
    } catch (err) {
        res.status(400).json({message: err.message});
    }
});

router.put('/ingredient/:productId', async (req, res) => {
    try {
        const ingredientObject = await Ingredient.findOne({productId: req.params.productId});
        if (ingredientObject == null) {
            return res.status(404).json({message: 'Ingredient not found'});
        }

        if (req.body.name != null) ingredientObject.name = req.body.name;
        if (req.body.category != null) ingredientObject.category = req.body.category;
        if (req.body.product != null) ingredientObject.product = req.body.product;
        if (req.body.brand != null) ingredientObject.brand = req.body.brand;
        if (req.body.size != null) ingredientObject.size = req.body.size;
        if (req.body.sizeUnit != null) ingredientObject.sizeUnit = req.body.sizeUnit;
        if (req.body.price != null) ingredientObject.price = req.body.price;
        if (req.body.availableUnits != null) ingredientObject.availableUnits = req.body.availableUnits;
        if (req.body.supplier != null) ingredientObject.supplier = req.body.supplier; 
        
        const updatedIngredient = await ingredientObject.save();
        res.json(updatedIngredient);
    } catch (err) {
        res.status(400).json({message: err.message});
    }
});

router.delete('/ingredient/:productId', async (req, res) => {
    try {
        const ingredientObject = await Ingredient.findOne({productId: req.params.productId}); 
        if (ingredientObject == null) {
            return res.status(404).json({message: 'Ingredient not found'});
        }

        ingredientObject.isActive = false;
        ingredientObject.deletedAt = new Date();
        await ingredientObject.save();
        
        res.json({message: 'Ingredient deactivated successfully', ingredient: ingredientObject});
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

router.patch('/ingredient/:productId/restore', async (req, res) => {
    try {
        const ingredientObject = await Ingredient.findOne({productId: req.params.productId, isActive: false}); 
        if (ingredientObject == null) {
            return res.status(404).json({message: 'Deleted ingredient not found'});
        }
        
        ingredientObject.isActive = true;
        ingredientObject.deletedAt = null;
        await ingredientObject.save();
        
        res.json({message: 'Ingredient restored successfully', ingredient: ingredientObject});
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

module.exports = router;