const Recipe = require('../models/recipe');
const {
    processIngredientLine,
    calculateIndirectCosts
} = require('./costAnalysisBusinessController');

async function calculateRecipeCost(recipeId, selectedIngredients, servings) {
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) throw new Error(`Recipe with id ${recipeId} not found`);
    
    const lines = await Promise.all(
        selectedIngredients.map(selection => processIngredientLine(selection))
    );
    
    const ingredientsCost = lines.reduce((sum, line) => sum + line.totalCost, 0);
    const indirectCost = calculateIndirectCosts(ingredientsCost);
    const totalCost = ingredientsCost + indirectCost;
    const actualServings = servings || recipe.servings || 1;
    const costPerServing = totalCost / actualServings;
    
    return {
        recipeId,
        recipeName: recipe.name,
        servings: actualServings,
        lines,
        ingredientsCost,
        indirectCost,
        totalCost,
        costPerServing
    };
}

function calculateDiscount(subtotal, discountType, discountValue) {
    if (discountType === 'percentage') {
        return subtotal * (discountValue / 100);
    }
    return discountValue;
}

function calculateQuotationTaxes(amount, ivaPercent = 0, servicePercent = 0, otherPercent = 0) {
    const ivaAmount = amount * (ivaPercent / 100);
    const serviceAmount = amount * (servicePercent / 100);
    const otherAmount = amount * (otherPercent / 100);
    const totalTaxes = ivaAmount + serviceAmount + otherAmount;
    
    return {
        ivaPercent,
        servicePercent,
        otherPercent,
        ivaAmount,
        serviceAmount,
        otherAmount,
        totalTaxes
    };
}

function estimateClientQuotationCost(numberOfGuests, eventType) {
    const baseRates = {
        wedding: 25,
        corporate_event: 20,
        birthday_party: 15,
        other: 18
    };
    
    const baseRate = baseRates[eventType] || baseRates.other;
    return numberOfGuests * baseRate;
}

module.exports = {
    calculateRecipeCost,
    calculateDiscount,
    calculateQuotationTaxes,
    estimateClientQuotationCost
};