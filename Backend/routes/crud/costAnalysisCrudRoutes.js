const express = require('express');
const router = express.Router();
const CostAnalysis = require('../../models/costAnalysis');
const Recipe = require('../../models/recipe');
const Ingredient = require('../../models/ingredient');
const {
    calculateIngredientsCost,
    calculateProductCost,
    calculateTaxes,
} = require('../../controllers/costAnalysisBusinessController');

router.get('/costanalysis/recipe/:id/ingredients-options', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        
        const items = await Promise.all(
            recipe.ingredients.map(async (ingredient) => {
                const options = await Ingredient.find({ 
                    product: ingredient.ingredientName 
                });
                return { ingredient, options };
            })
        );
        
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
        const { 
            recipeId, 
            selectedIngredients, 
            ivaPercent = 0, 
            servicePercent = 0,
            margin = 3 
        } = req.body;

        if (recipeId && selectedIngredients && selectedIngredients.length > 0) {
            const recipe = await Recipe.findById(recipeId);
            if (!recipe) {
                return res.status(404).json({ message: 'Recipe not found' });
            }

            const step1 = await calculateIngredientsCost(selectedIngredients);

            const step2 = calculateProductCost(
                step1.ingredientsCost,
                step1.indirectCost,
                recipe.servings,
                margin
            );

            const step3 = calculateTaxes(
                step2.suggestedPricePerServing,
                ivaPercent,
                servicePercent
            );

            const document = new CostAnalysis({
                recipeId: recipe._id,
                recipeName: recipe.name,
                servings: recipe.servings,
                ingredients: step1.lines,
                ingredientsCost: step1.ingredientsCost,
                indirectCost: step1.indirectCost,
                totalCost: step2.totalCost,
                costPerServing: step2.costPerServing,
                suggestedPricePerServing: step2.suggestedPricePerServing,
                taxes: step3.taxes
            });
            
            await document.save();
            return res.status(201).json(document);
        }
        
        const document = new CostAnalysis(req.body);
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
        const documents = await CostAnalysis.find()
            .sort({ createdAt: -1 }); 
        
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
        
        if (!document) {
            return res.status(404).json({ message: 'Cost analysis not found' });
        }
        
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
        const existingDoc = await CostAnalysis.findById(req.params.id);
        if (!existingDoc) {
            return res.status(404).json({ message: 'Cost analysis not found' });
        }

        const { 
            selectedIngredients,
            recalculateIngredients = false,
            recalculateProduct = false,
            recalculateTaxes = false,
            ivaPercent,
            servicePercent,
            margin,
            servings
        } = req.body;
        if (recalculateIngredients && selectedIngredients && selectedIngredients.length > 0) {
            const step1 = await calculateIngredientsCost(selectedIngredients);

            req.body.ingredients = step1.lines;
            req.body.ingredientsCost = step1.ingredientsCost;
            req.body.indirectCost = step1.indirectCost;
            const step2 = calculateProductCost(
                step1.ingredientsCost,
                step1.indirectCost,
                servings || existingDoc.servings,
                margin || 3
            );

            req.body.totalCost = step2.totalCost;
            req.body.costPerServing = step2.costPerServing;
            req.body.suggestedPricePerServing = step2.suggestedPricePerServing;
            const step3 = calculateTaxes(
                step2.suggestedPricePerServing,
                ivaPercent ?? existingDoc.taxes?.ivaPercent ?? 0,
                servicePercent ?? existingDoc.taxes?.servicePercent ?? 0
            );

            req.body.taxes = step3.taxes;
        }
        else if (recalculateProduct) {
            const step2 = calculateProductCost(
                req.body.ingredientsCost ?? existingDoc.ingredientsCost,
                req.body.indirectCost ?? existingDoc.indirectCost,
                servings ?? existingDoc.servings,
                margin || 3
            );

            req.body.totalCost = step2.totalCost;
            req.body.costPerServing = step2.costPerServing;
            req.body.suggestedPricePerServing = step2.suggestedPricePerServing;
            const step3 = calculateTaxes(
                step2.suggestedPricePerServing,
                ivaPercent ?? existingDoc.taxes?.ivaPercent ?? 0,
                servicePercent ?? existingDoc.taxes?.servicePercent ?? 0
            );

            req.body.taxes = step3.taxes;
        }
        else if (recalculateTaxes || ivaPercent !== undefined || servicePercent !== undefined) {
            const step3 = calculateTaxes(
                req.body.suggestedPricePerServing ?? existingDoc.suggestedPricePerServing,
                ivaPercent ?? existingDoc.taxes?.ivaPercent ?? 0,
                servicePercent ?? existingDoc.taxes?.servicePercent ?? 0
            );

            req.body.taxes = step3.taxes;
        }
        const document = await CostAnalysis.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        
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
        
        if (!document) {
            return res.status(404).json({ message: 'Cost analysis not found' });
        }
        
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ 
            message: 'Error deleting cost analysis', 
            error: error.message 
        });
    }
});

module.exports = router;