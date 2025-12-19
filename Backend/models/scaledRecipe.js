const mongoose = require('mongoose');

const scaledRecipeSchema = new mongoose.Schema(
{
    recipeId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Recipe', 
        required: true 
    },

    recipeName: { type: String, required: true },
    category: { type: String, required: true },

    scaling: {
        originalServings: { type: Number, required: true },
        newServings: { type: Number, required: true },
        scaleFactor: { type: Number, required: true }
    },

    ingredients: [
        {
            ingredientName: { type: String, required: true },
            productId: { type: String, required: true },
            originalQuantity: { type: Number, required: true },
            originalUnit: { type: String, required: true },
            scaledQuantity: { type: Number, required: true },
            scaledUnit: { type: String, required: true },
            cost: { type: Number, required: true }
        }
    ],

    costs: {
        totalCost: { type: Number, required: true },
        costPerServing: { type: Number, required: true },
        profitMargin: { type: String, required: true },
        pricePerServing: { type: Number, required: true },
        totalPrice: { type: Number, required: true },
        totalProfit: { type: Number, required: true },
        profitPerServing: { type: Number, required: true }
    },

    supplies: [
        {
            ingredientName: { type: String },
            category: { type: String },
            quantityNeeded: { type: Number },
            unit: { type: String },
            licoresNeeded: { type: Number },
            frutasNeeded: { type: Number },
            verdurasNeeded: { type: Number },
            lacteosNeeded: { type: Number },
            bebidasNeeded: { type: Number },
            unitsNeeded: { type: Number },
            packageSize: { type: Number },
            packageUnit: { type: String }
        }
    ],

    isActive: { type: Boolean, default: true },
    deletedAt: { type: Date, default: null }
},
{
    collection: 'scaledRecipes',
    timestamps: true
});

module.exports = mongoose.model('ScaledRecipe', scaledRecipeSchema);
