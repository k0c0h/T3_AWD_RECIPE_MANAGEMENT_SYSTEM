const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        servings: { type: Number, required: true },
        description: { type: String, required: true },
        imageUrl: { type: String, default: null },


        ingredients: [
            {
                ingredientName: { type: String, required: true },
                productId: { type: String, required: true },
                quantity: { type: Number, required: true },
                unit: { type: String, required: true }
            }
        ],

        instructions: [{ type: String, required: true }],

        costPerServing: { type: Number, default: 0 },
        pricePerServing: { type: Number, default: 0 },

        category: { type: String, required: true },

        isActive: { type: Boolean, default: true },
        deletedAt: { type: Date, default: null }
    },
    {
        collection: 'recipe',
        timestamps: true
    });

module.exports = mongoose.model('Recipe', recipeSchema);
