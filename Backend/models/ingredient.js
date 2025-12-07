const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema(
    {
  productId: {type: String, required: true, unique: true},
        name: {type: String, required: true},
        category: {type: String, required: true},
        product: {type: String, required: true},
        brand: {type: String, required: true},
        size: {type: Number, required: true},
        sizeUnit: {type: String, required: true},
        price: {type: Number, required: true},
        availableUnits: {type: Number, required: true},
        supplier: {type: String, required: true},
        isActive: {type: Boolean, required: true, default: true},
        deletedAt: {type: Date, default: null}
},
    {
        collection: 'ingredient',
        timestamps: true 
    }
);

module.exports = mongoose.model('Ingredient', ingredientSchema);