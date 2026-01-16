const Ingredient = require('../models/ingredient');

async function calculateCosts(ingredients, servings) {
  let totalCost = 0;
  const updatedIngredients = [];

  for (const ing of ingredients) {
    const ingredientData = await Ingredient.findOne({ productId: ing.productId });
    if (!ingredientData) {
      throw new Error(`Ingredient not found: ${ing.productId}`);
    }
    const cost = (ing.quantity / ingredientData.size) * ingredientData.price;
    totalCost += cost;

    updatedIngredients.push({
      ...ing,
      ingredientId: ingredientData._id
    });
  }

  const costPerServing = totalCost / servings;
  const pricePerServing = costPerServing * 2; 

  return { updatedIngredients, costPerServing, pricePerServing };
}

module.exports = {
  calculateCosts,
};
