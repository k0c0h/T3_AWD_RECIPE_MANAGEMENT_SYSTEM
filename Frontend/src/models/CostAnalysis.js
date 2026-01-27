class CostAnalysis {
  constructor(data = {}) {
    this._id = data._id || null;
    this.recipeName = data.recipeName || '';
    this.recipeId = data.recipeId || null;
    this.totalCost = data.totalCost || 0;
    this.ingredients = data.ingredients || [];
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    this.notes = data.notes || '';
    this.servings = data.servings || 1;
  }

  validate() {
    const errors = [];

    if (!this.recipeName || this.recipeName.trim() === '') {
      errors.push('Recipe name is required');
    }

    if (this.totalCost < 0) {
      errors.push('Total cost cannot be negative');
    }

    if (this.servings < 1) {
      errors.push('Servings must be at least 1');
    }

    if (!Array.isArray(this.ingredients)) {
      errors.push('Ingredients must be an array');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  getCostPerServing() {
    if (this.servings <= 0) return 0;
    return this.totalCost / this.servings;
  }

  getFormattedTotalCost(currency = '$', decimals = 2) {
    return `${currency}${this.totalCost.toFixed(decimals)}`;
  }

  getFormattedCostPerServing(currency = '$', decimals = 2) {
    return `${currency}${this.getCostPerServing().toFixed(decimals)}`;
  }

  getFormattedCreatedAt(locale = 'en-US') {
    return this.createdAt.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  matchesSearch(searchTerm) {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return this.recipeName.toLowerCase().includes(search) ||
           this.notes.toLowerCase().includes(search);
  }

  toJSON() {
    return {
      _id: this._id,
      recipeName: this.recipeName,
      recipeId: this.recipeId,
      totalCost: this.totalCost,
      ingredients: this.ingredients,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      notes: this.notes,
      servings: this.servings
    };
  }

  static fromJSON(data) {
    return new CostAnalysis(data);
  }

  static fromJSONArray(dataArray) {
    if (!Array.isArray(dataArray)) return [];
    return dataArray.map(data => CostAnalysis.fromJSON(data));
  }

  clone() {
    return new CostAnalysis(this.toJSON());
  }

  update(updates) {
    Object.keys(updates).forEach(key => {
      if (this.hasOwnProperty(key)) {
        this[key] = updates[key];
      }
    });
    this.updatedAt = new Date();
  }
}

export default CostAnalysis;