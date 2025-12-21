const express = require('express');
const router = express.Router();
const Quotation = require('../../models/quotation');
const {
    calculateRecipeCost,
    calculateDiscount,
    calculateQuotationTaxes,
    estimateClientQuotationCost
} = require('../../controllers/quotationBusinessController');

router.post('/quotations/client-request', async (req, res) => {
    try {
        const { clientInfo, eventInfo, budgetRange } = req.body;
        
        if (!clientInfo || !eventInfo) {
            return res.status(400).json({ 
                message: 'clientInfo and eventInfo are required' 
            });
        }
        
        const estimatedCost = estimateClientQuotationCost(
            eventInfo.numberOfGuests,
            eventInfo.eventType
        );
        
        const quotation = new Quotation({
            quotationType: 'client_request',
            status: 'pending',
            clientInfo,
            eventInfo,
            budgetRange,
            estimatedCost
        });
        
        await quotation.save();
        res.status(201).json(quotation);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating client request', 
            error: error.message 
        });
    }
});

router.post('/quotations/chef-calculate', async (req, res) => {
    try {
        const { 
            recipes, 
            discountType = 'percentage', 
            discountValue = 0,
            ivaPercent = 0,
            servicePercent = 0,
            otherPercent = 0
        } = req.body;
        
        if (!recipes || recipes.length === 0) {
            return res.status(400).json({ message: 'Recipes are required' });
        }
        
        const calculatedRecipes = await Promise.all(
            recipes.map(recipe => 
                calculateRecipeCost(
                    recipe.recipeId, 
                    recipe.selectedIngredients,
                    recipe.servings
                )
            )
        );
        
        const subtotal = calculatedRecipes.reduce((sum, recipe) => sum + recipe.totalCost, 0);
        const discountAmount = calculateDiscount(subtotal, discountType, discountValue);
        const amountAfterDiscount = subtotal - discountAmount;
        const taxes = calculateQuotationTaxes(amountAfterDiscount, ivaPercent, servicePercent, otherPercent);
        const totalAmount = amountAfterDiscount + taxes.totalTaxes;
        
        res.json({
            recipes: calculatedRecipes,
            discount: {
                type: discountType,
                value: discountValue
            },
            subtotal,
            discountAmount,
            taxes,
            totalAmount
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error calculating chef quotation', 
            error: error.message 
        });
    }
});

router.post('/quotations/chef-quotation', async (req, res) => {
    try {
        const { 
            clientInfo,
            eventInfo,
            recipes,
            discountType = 'percentage',
            discountValue = 0,
            ivaPercent = 0,
            servicePercent = 0,
            otherPercent = 0,
            chefId
        } = req.body;
        
        if (!clientInfo || !eventInfo || !recipes || recipes.length === 0) {
            return res.status(400).json({ 
                message: 'clientInfo, eventInfo and recipes are required' 
            });
        }
        
        const calculatedRecipes = await Promise.all(
            recipes.map(recipe => 
                calculateRecipeCost(
                    recipe.recipeId, 
                    recipe.selectedIngredients,
                    recipe.servings
                )
            )
        );
        
        const subtotal = calculatedRecipes.reduce((sum, recipe) => sum + recipe.totalCost, 0);
        const discountAmount = calculateDiscount(subtotal, discountType, discountValue);
        const amountAfterDiscount = subtotal - discountAmount;
        const taxes = calculateQuotationTaxes(amountAfterDiscount, ivaPercent, servicePercent, otherPercent);
        const totalAmount = amountAfterDiscount + taxes.totalTaxes;
        
        const quotation = new Quotation({
            quotationType: 'chef_quotation',
            status: 'pending',
            clientInfo,
            eventInfo,
            recipes: calculatedRecipes,
            discount: {
                type: discountType,
                value: discountValue
            },
            subtotal,
            discountAmount,
            taxes,
            totalAmount,
            chefId
        });
        
        await quotation.save();
        res.status(201).json(quotation);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating chef quotation', 
            error: error.message 
        });
    }
});

module.exports = router;