const Ingredient = require('../models/ingredient');
const Units = require('../models/units');
const Recipe = require('../models/recipe');

const round2 = (v) => Math.round((v + Number.EPSILON) * 100) / 100;

async function getUnit(name) {
    return Units.findOne({ name });
}

async function toBase(value, unitName) {
    const unit = await getUnit(unitName);
    if (!unit) throw new Error(`Unit "${unitName}" not found`);
    return value * unit.toBase;
}

async function getUnitCostFromIngredient(ingredientDoc) {
    const packageBaseValue = await toBase(ingredientDoc.size, ingredientDoc.sizeUnit);
    return ingredientDoc.price / packageBaseValue;
}

async function computeLineCost(ingredientDoc, quantity, unitName) {
    const unitCostRaw = await getUnitCostFromIngredient(ingredientDoc);
    const quantityInBase = await toBase(quantity, unitName);
    const totalRaw = unitCostRaw * quantityInBase;
    return { 
        unitCost: round2(unitCostRaw), 
        totalCost: round2(totalRaw) 
    };
} 

async function processIngredientLine(selection) {
    const ingredient = await Ingredient.findOne({ productId: selection.productId });
    if (!ingredient) {
        throw new Error(`Ingredient with productId ${selection.productId} not found`);
    }
    
    const { unitCost, totalCost } = await computeLineCost(
        ingredient, 
        selection.quantity, 
        selection.unit
    );
    
    return { 
        productId: selection.productId, 
        name: ingredient.name, 
        quantity: selection.quantity, 
        unit: selection.unit, 
        unitCost, 
        totalCost 
    };
}

async function calculateIngredientsCost(selectedIngredients) {
    if (!selectedIngredients || selectedIngredients.length === 0) {
        throw new Error('selectedIngredients array is required');
    }

    const lines = await Promise.all(
        selectedIngredients.map(selection => processIngredientLine(selection))
    );
    
    const ingredientsCostRaw = lines.reduce((sum, line) => sum + line.totalCost, 0);
    const ingredientsCost = round2(ingredientsCostRaw);
    const indirectCost = round2(ingredientsCost * 0.25); 
    
    return {
        lines,
        ingredientsCost,
        indirectCost
    }; 
}

function calculateProductCost(ingredientsCost, indirectCost, servings, margin = 3) {
    if (ingredientsCost === undefined || ingredientsCost < 0) {
        throw new Error('ingredientsCost is required and must be >= 0');
    }

    if (indirectCost === undefined || indirectCost < 0) {
        throw new Error('indirectCost is required and must be >= 0');
    }

    if (!servings || servings <= 0) {
        throw new Error('servings must be a positive number');
    }

    const totalCost = round2(ingredientsCost + indirectCost);
    const costPerServing = round2(totalCost / servings);
    const suggestedPricePerServing = round2(costPerServing * margin);
    
    return {
        totalCost,
        costPerServing,
        suggestedPricePerServing,
        margin
    }; 
}

function calculateTaxes(suggestedPricePerServing, ivaPercent = 0, servicePercent = 0) {
    if (!suggestedPricePerServing || suggestedPricePerServing <= 0) {
        throw new Error('suggestedPricePerServing must be a positive number');
    }

    const ivaAmount = round2(suggestedPricePerServing * (ivaPercent / 100));
    const serviceAmount = round2(suggestedPricePerServing * (servicePercent / 100));
    const totalTaxes = round2(ivaAmount + serviceAmount);
    
    return {
        taxes: {
            ivaPercent,
            servicePercent,
            ivaAmount,
            serviceAmount,
            totalTaxes
        },
        finalPrice: round2(suggestedPricePerServing + totalTaxes)
    }; 
}

async function calculateCompleteCostAnalysis(recipeId, selectedIngredients, ivaPercent = 0, servicePercent = 0, margin = 3) {
    if (!recipeId || !selectedIngredients || selectedIngredients.length === 0) {
        throw new Error('recipeId and selectedIngredients are required');
    }

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
        throw new Error('Recipe not found');
    }

    const step1 = await calculateIngredientsCost(selectedIngredients);
    
    const servings = recipe.servings || 1;
    const step2 = calculateProductCost(
        step1.ingredientsCost, 
        step1.indirectCost, 
        servings, 
        margin
    );
    
    const step3 = calculateTaxes(
        step2.suggestedPricePerServing, 
        ivaPercent, 
        servicePercent
    );
    
    return {
        recipeId,
        recipeName: recipe.name,
        servings,
        lines: step1.lines,
        ingredientsCost: round2(step1.ingredientsCost),
        indirectCost: round2(step1.indirectCost),
        totalCost: round2(step2.totalCost),
        costPerServing: round2(step2.costPerServing),
        suggestedPricePerServing: round2(step2.suggestedPricePerServing),
        margin: step2.margin,
        taxes: step3.taxes,
        finalPrice: round2(step3.finalPrice)
    };
}

module.exports = {
    processIngredientLine,
    calculateIngredientsCost,
    calculateProductCost,
    calculateTaxes,
    calculateCompleteCostAnalysis
};