const mongoose = require('mongoose');

const costAnalysisSchema = new mongoose.Schema({
    recipeId: { type: String, required: true },
    recipeName: { type: String, required: true },
    servings: { type: Number, required: true },
    ingredients: [
        {
            productId: { type: String, required: true },
            name: { type: String, required: true },
            quantity: { type: Number, required: true },
            unit: { type: String, required: true },
            unitCost: { type: Number, required: true },
            totalCost: { type: Number, required: true }
        }
    ],
    ingredientsCost: { type: Number, required: true },
    indirectCost: { type: Number, required: true },
    totalCost: { type: Number, required: true },
    costPerServing: { type: Number, required: true },
    suggestedPricePerServing: { type: Number, required: true },
    taxes: {
        ivaPercent: { type: Number, default: 0 },
        servicePercent: { type: Number, default: 0 },
        ivaAmount: { type: Number, default: 0 },
        serviceAmount: { type: Number, default: 0 },
        totalTaxes: { type: Number, default: 0 }
    }
}, {
    collection: 'costanalysis',
    timestamps: true
});

module.exports = mongoose.model('CostAnalysis', costAnalysisSchema);
