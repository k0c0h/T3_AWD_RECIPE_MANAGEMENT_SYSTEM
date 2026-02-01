const express = require('express');
const router = express.Router();
const {
    calculateIngredientsCost,
    calculateProductCost,
    calculateTaxes,
    calculateCompleteCostAnalysis
} = require('../../controllers/costAnalysisBusinessController');

router.post('/costanalysis/calculate/complete', async (req, res) => {
    try {
        const { recipeId, selectedIngredients, ivaPercent = 0, servicePercent = 0, margin = 3 } = req.body;

        if (!recipeId || !selectedIngredients) {
            return res.status(400).json({ message: 'recipeId and selectedIngredients are required' });
        }

        const result = await calculateCompleteCostAnalysis(
            recipeId,
            selectedIngredients,
            ivaPercent,
            servicePercent,
            margin
        );

        res.json(result);
    } catch (error) {
        res.status(400).json({
            message: 'Error calculating complete cost analysis',
            error: error.message
        });
    }
});

router.post('/costanalysis/calculate/ingredients-cost', async (req, res) => {
    try {
        const { selectedIngredients } = req.body;
        
        const result = await calculateIngredientsCost(selectedIngredients);
        
        res.json(result);
    } catch (error) {
        res.status(400).json({ 
            message: 'Error calculating ingredients cost', 
            error: error.message 
        });
    }
});

router.post('/costanalysis/calculate/product-cost', async (req, res) => {
    try {
        const { 
            ingredientsCost,
            indirectCost,
            servings,
            margin = 3
        } = req.body;
        
        const result = calculateProductCost(
            ingredientsCost,
            indirectCost,
            servings,
            margin
        );
        
        res.json(result);
    } catch (error) {
        res.status(400).json({ 
            message: 'Error calculating product cost', 
            error: error.message 
        });
    }
});

router.post('/costanalysis/calculate/taxes', async (req, res) => {
    try {
        const { 
            suggestedPricePerServing,
            ivaPercent = 0, 
            servicePercent = 0
        } = req.body;
        
        const result = calculateTaxes(
            suggestedPricePerServing,
            ivaPercent,
            servicePercent
        );
        
        res.json(result);
    } catch (error) {
        res.status(400).json({ 
            message: 'Error calculating taxes', 
            error: error.message 
        });
    }
});
module.exports = router;