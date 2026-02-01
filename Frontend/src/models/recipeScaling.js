class RecipeScaling {
  constructor(data = {}) {
    this.recipeId = data.recipeId || null;
    this.originalServings = data.originalServings || 1;
    this.newServings = data.newServings || 1;
    this.ingredients = data.ingredients || [];
  }

  validate() {
    const errors = [];

    if (!this.recipeId) errors.push('Recipe ID is required');
    if (this.newServings < 1) errors.push('New servings must be >= 1');

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  getScaleFactor() {
    return this.newServings / this.originalServings;
  }
}

export default RecipeScaling;
