const express = require('express');
const router = express.Router();
const {
    calculateRecipeCost,
    calculateDiscount,
    calculateQuotationTaxes,
    estimateClientQuotationCost
} = require('../../controllers/quotationBusinessController');
const {
    createCalendarEventForQuotation
} = require('../../controllers/calendarBusinessController');

// POST - Calcular estimado para solicitud de cliente (SIN guardar)
router.post('/quotations/client-request/estimate', async (req, res) => {
    try {
        const { eventInfo, budgetRange } = req.body;
        
        if (!eventInfo) {
            return res.status(400).json({ 
                message: 'eventInfo is required' 
            });
        }
        
        const estimatedCost = estimateClientQuotationCost(
            eventInfo.numberOfGuests,
            eventInfo.eventType
        );
        
        res.json({ 
            estimatedCost,
            budgetRange
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error estimating cost', 
            error: error.message 
        });
    }
});

// POST - Calcular cotización de chef (SIN guardar)
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

// PATCH - Aprobar cotización y crear evento de calendario (BUSINESS LOGIC)
// Este endpoint combina: 1) Crear evento automático (Business), 2) Retorna la quotation actualizada
router.patch('/quotations/:id/approve-and-schedule', async (req, res) => {
    try {
        const Quotation = require('../../models/quotation');
        
        const quotation = await Quotation.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true }
        );

        if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

        // Lógica de negocio: crear evento de calendario automáticamente
        await createCalendarEventForQuotation(quotation);

        res.json(quotation);

    } catch (error) {
        res.status(500).json({
            message: 'Error approving quotation and scheduling event',
            error: error.message
        });
    }
});

module.exports = router;