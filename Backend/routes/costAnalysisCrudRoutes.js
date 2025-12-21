const express = require('express');
const router = express.Router();
const CostAnalysis = require('../../models/costAnalysis');
const Recipe = require('../../models/recipe');
const Ingredient = require('../../models/ingredient');

router.get('/costanalysis/recipe/:id/ingredients-options', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
        
        const items = await Promise.all(recipe.ingredients.map(async (ingredient) => {
            const options = await Ingredient.find({ product: ingredient.ingredientName });
            return { ingredient, options };
        }));
        
        res.json({ 
            recipeId: recipe._id, 
            name: recipe.name, 
            servings: recipe.servings, 
            items 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching ingredients options', 
            error: error.message 
        });
    }
});

router.post('/costanalysis', async (req, res) => {
    try {
        const body = req.body || {};
        const taxes = body.taxes || {};
        
        if (body.costPerServing && (taxes.ivaPercent || taxes.servicePercent)) {
            const basePrice = body.costPerServing * 3;
            const ivaAmount = basePrice * ((taxes.ivaPercent || 0) / 100);
            const serviceAmount = basePrice * ((taxes.servicePercent || 0) / 100);
            taxes.ivaAmount = ivaAmount;
            taxes.serviceAmount = serviceAmount;
            taxes.totalTaxes = ivaAmount + serviceAmount;
            body.suggestedPricePerServing = basePrice + taxes.totalTaxes;
        }
        
        body.taxes = taxes;
        const document = new CostAnalysis(body);
        await document.save();
        
        res.status(201).json(document);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating cost analysis', 
            error: error.message 
        });
    }
});

router.get('/costanalysis', async (req, res) => {
    try {
        const documents = await CostAnalysis.find();
        res.json(documents);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching cost analyses', 
            error: error.message 
        });
    }
});

router.get('/costanalysis/:id', async (req, res) => {
    try {
        const document = await CostAnalysis.findById(req.params.id);
        if (!document) return res.status(404).json({ message: 'Cost analysis not found' });
        
        res.json(document);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching cost analysis', 
            error: error.message 
        });
    }
});

router.put('/costanalysis/:id', async (req, res) => {
    try {
        const document = await CostAnalysis.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        
        if (!document) return res.status(404).json({ message: 'Cost analysis not found' });
        
        res.json(document);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating cost analysis', 
            error: error.message 
        });
    }
});

router.delete('/costanalysis/:id', async (req, res) => {
    try {
        const document = await CostAnalysis.findByIdAndDelete(req.params.id);
        if (!document) return res.status(404).json({ message: 'Cost analysis not found' });
        
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ 
            message: 'Error deleting cost analysis', 
            error: error.message 
        });
    }
});

module.exports = router;
