const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['cocktail', 'main-course', 'appetizer', 'dessert', 'beverage']
  },
  servings: {
    type: Number,
    required: true,
    min: 1
  },
  description: {
    type: String,
    trim: true
  },
  ingredients: [{
    ingredientName: {
      type: String,
      required: true
    },
    productId: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 0
    },
    unit: {
      type: String,
      required: true,
      enum: ['g', 'kg', 'ml', 'l', 'oz', 'lb', 'unidad', 'taza', 'cucharada', 'cucharadita', 'dash', 'pizca']
    }
  }],
  instructions: [{
    type: String
  }],
  // this should be calculated automatically while inserting a recipe
  totalCost: {
    type: Number,
    min: 0
  },
  costPerServing: {
    type: Number,
    min: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Recipe', recipeSchema);
