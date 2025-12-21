const express = require('express');
const router = express.Router();
const Recipe = require('../../models/recipe');
const {
    processIngredientLine,
    calculateIndirectCosts,
    calculateTaxes
} = require('../../controllers/costAnalysisBusinessController');

router.post('/costanalysis/calculate', async (req, res) => {
    try {
        const { recipeId, selectedIngredients, ivaPercent = 0, servicePercent = 0 } = req.body;
        
        if (!recipeId || !selectedIngredients || selectedIngredients.length === 0) {
            return res.status(400).json({ 
                message: 'recipeId and selectedIngredients are required' 
            });
        }

        const recipe = await Recipe.findById(recipeId);
        if (!recipe) return res.status(404).json({ message: 'Recipe not found' });
        
        const lines = await Promise.all(
            selectedIngredients.map(selection => processIngredientLine(selection))
        );
        
        const ingredientsCost = lines.reduce((sum, line) => sum + line.totalCost, 0);
        const indirectCost = calculateIndirectCosts(ingredientsCost);
        const totalCost = ingredientsCost + indirectCost;
        
        const servings = recipe.servings || 1;
        const costPerServing = totalCost / servings;
        const basePrice = costPerServing * 3;
        
        const taxes = calculateTaxes(basePrice, ivaPercent, servicePercent);
        const suggestedPricePerServing = basePrice + taxes.totalTaxes;
        
        res.json({ 
            recipeId, 
            recipeName: recipe.name, 
            servings, 
            lines, 
            ingredientsCost, 
            indirectCost, 
            totalCost, 
            costPerServing, 
            taxes,
            suggestedPricePerServing
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error calculating cost', 
            error: error.message 
        });
    }
});

module.exports = router;