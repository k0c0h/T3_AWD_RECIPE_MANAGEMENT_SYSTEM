const express = require('express');
const router = express.Router();
const {
    calculateIngredientsCost,
    calculateProductCost,
    calculateTaxes
} = require('../../controllers/costAnalysisBusinessController');

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