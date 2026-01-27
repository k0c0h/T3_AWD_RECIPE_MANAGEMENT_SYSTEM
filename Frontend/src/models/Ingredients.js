class Ingredient {
  constructor(data = {}) {
    this._id = data._id || null;
    this.productId = data.productId || '';
    this.name = data.name || '';
    this.product = data.product || '';
    this.brand = data.brand || '';
    this.category = data.category || '';
    this.price = data.price || 0;
    this.quantity = data.quantity || 0;
    this.unit = data.unit || '';
    this.unitCost = data.unitCost || 0;
    this.isActive = data.isActive !== false;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    this.notes = data.notes || '';
  }

  validate() {
    const errors = {};

    if (!this.productId || this.productId.trim() === '') {
      errors.productId = 'Product ID is required';
    }

    if (!this.name || this.name.trim() === '') {
      errors.name = 'Name is required';
    }

    if (!this.product || this.product.trim() === '') {
      errors.product = 'Product is required';
    }

    if (!this.brand || this.brand.trim() === '') {
      errors.brand = 'Brand is required';
    }

    if (!this.category || this.category.trim() === '') {
      errors.category = 'Category is required';
    }

    if (this.price < 0) {
      errors.price = 'Price cannot be negative';
    }

    if (this.quantity < 0) {
      errors.quantity = 'Quantity cannot be negative';
    }

    if (!this.unit || this.unit.trim() === '') {
      errors.unit = 'Unit is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  calculateUnitCost() {
    if (this.quantity <= 0) return 0;
    return this.price / this.quantity;
  }

  updateUnitCost() {
    this.unitCost = this.calculateUnitCost();
  }

  getFormattedPrice(currency = '$', decimals = 2) {
    return `${currency}${this.price.toFixed(decimals)}`;
  }

  getFormattedUnitCost(currency = '$', decimals = 2) {
    return `${currency}${this.unitCost.toFixed(decimals)}`;
  }

  getFormattedQuantity() {
    return `${this.quantity} ${this.unit}`;
  }

  isInStock(threshold = 0) {
    return this.quantity > threshold;
  }

  matchesSearch(searchTerm) {
    if (!searchTerm) return true;
    
    const search = searchTerm.toLowerCase();
    return this.name.toLowerCase().includes(search) ||
           this.productId.toLowerCase().includes(search) ||
           this.product.toLowerCase().includes(search) ||
           this.brand.toLowerCase().includes(search);
  }

  belongsToCategory(category) {
    if (!category || category === 'all') return true;
    return this.category === category;
  }

  archive() {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  restore() {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  getFormattedCreatedAt(locale = 'en-US') {
    return this.createdAt.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  toJSON() {
    return {
      _id: this._id,
      productId: this.productId,
      name: this.name,
      product: this.product,
      brand: this.brand,
      category: this.category,
      price: this.price,
      quantity: this.quantity,
      unit: this.unit,
      unitCost: this.unitCost,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      notes: this.notes
    };
  }

  static fromJSON(data) {
    return new Ingredient(data);
  }

  static fromJSONArray(dataArray) {
    if (!Array.isArray(dataArray)) return [];
    return dataArray.map(data => Ingredient.fromJSON(data));
  }

  static filterByStatus(ingredients, activeOnly = true) {
    return ingredients.filter(ing => 
      activeOnly ? ing.isActive : !ing.isActive
    );
  }

  static filterByCategory(ingredients, category) {
    if (!category || category === 'all') return ingredients;
    return ingredients.filter(ing => ing.category === category);
  }

  static calculateTotalValue(ingredients) {
    return ingredients.reduce((sum, ing) => sum + (ing.price || 0), 0);
  }

  static getUniqueCategories(ingredients) {
    return [...new Set(ingredients.map(ing => ing.category))].filter(Boolean);
  }

  clone() {
    return new Ingredient(this.toJSON());
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

export default Ingredient;