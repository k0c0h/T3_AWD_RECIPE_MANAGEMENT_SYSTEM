const Ingredient = require('../models/ingredient');
const Units = require('../models/units');

async function getUnit(name) {
    return Units.findOne({ name });
}

async function toBase(value, unitName) {
    const unit = await getUnit(unitName);
    if (!unit) throw new Error('Unit not found');
    return value * unit.toBase;
}

async function getUnitCostFromIngredient(ingredientDoc) {
    const packageBaseValue = await toBase(ingredientDoc.size, ingredientDoc.sizeUnit);
    return ingredientDoc.price / packageBaseValue;
}

async function computeLineCost(ingredientDoc, quantity, unitName) {
    const unitCost = await getUnitCostFromIngredient(ingredientDoc);
    const quantityInBase = await toBase(quantity, unitName);
    return { 
        unitCost, 
        totalCost: unitCost * quantityInBase 
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

function calculateIndirectCosts(ingredientsCost) {
    return ingredientsCost * 0.25;
}

function calculateTaxes(basePrice, ivaPercent, servicePercent) {
    const ivaAmount = basePrice * (ivaPercent / 100);
    const serviceAmount = basePrice * (servicePercent / 100);
    const totalTaxes = ivaAmount + serviceAmount;
    
    return {
        ivaPercent,
        servicePercent,
        ivaAmount,
        serviceAmount,
        totalTaxes
    };
}

module.exports = {
    processIngredientLine,
    calculateIndirectCosts,
    calculateTaxes
};