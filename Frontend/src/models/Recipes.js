class Recipe {
  constructor(data = {}) {
    this._id = data._id || null;
    this.name = data.name || '';
    this.category = data.category || '';
    this.servings = data.servings || 1;
    this.description = data.description || '';
    this.ingredients = data.ingredients || [];
    this.instructions = data.instructions || [];
    this.prepTime = data.prepTime || 0;
    this.cookTime = data.cookTime || 0;
    this.difficulty = data.difficulty || 'medium';
    this.image = data.imageUrl || data.image || '';
    this.tags = data.tags || [];
    this.isActive = data.isActive !== false;
    this.createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
    this.updatedAt = data.updatedAt ? new Date(data.updatedAt) : new Date();
    this.notes = data.notes || '';
  }

  validate() {
    const errors = {};
    if (!this.name || this.name.trim() === '') errors.name = 'Name is required';
    if (!this.category || this.category.trim() === '') errors.category = 'Category is required';
    if (!this.description || this.description.trim() === '') errors.description = 'Description is required';
    if (this.servings < 1) errors.servings = 'Servings must be at least 1';
    if (!Array.isArray(this.ingredients) || this.ingredients.length === 0) errors.ingredients = 'At least one ingredient is required';
    if (!Array.isArray(this.instructions) || this.instructions.length === 0) errors.instructions = 'At least one instruction is required';
    if (this.prepTime < 0) errors.prepTime = 'Preparation time cannot be negative';
    if (this.cookTime < 0) errors.cookTime = 'Cooking time cannot be negative';
    return { isValid: Object.keys(errors).length === 0, errors };
  }

  getTotalTime() {
    return this.prepTime + this.cookTime;
  }

  getFormattedTotalTime() {
    const total = this.getTotalTime();
    if (total < 60) return `${total} min`;
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  }

  getFormattedPrepTime() {
    if (this.prepTime < 60) return `${this.prepTime} min`;
    const hours = Math.floor(this.prepTime / 60);
    const minutes = this.prepTime % 60;
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  }

  getFormattedCookTime() {
    if (this.cookTime < 60) return `${this.cookTime} min`;
    const hours = Math.floor(this.cookTime / 60);
    const minutes = this.cookTime % 60;
    return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
  }

  getDifficultyLabel() {
    const labels = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
    return labels[this.difficulty] || 'Medium';
  }

  matchesSearch(searchTerm) {
    if (!searchTerm || searchTerm.trim().length < 3) return true;
    const search = searchTerm.toLowerCase();
    return this.name.toLowerCase().includes(search) ||
      this.description.toLowerCase().includes(search) ||
      this.tags.some(tag => tag.toLowerCase().includes(search));
  }

  belongsToCategory(category) {
    if (!category || category === 'all') return true;
    return this.category === category;
  }

  meetsServingsRequirement(minServings) {
    if (!minServings || minServings <= 0) return true;
    return this.servings >= minServings;
  }

  scale(newServings) {
    if (newServings <= 0) return this.clone();
    const scaleFactor = newServings / this.servings;
    const scaledRecipe = this.clone();
    scaledRecipe.servings = newServings;
    scaledRecipe.ingredients = scaledRecipe.ingredients.map(ing => {
      if (ing.quantity && !isNaN(ing.quantity)) {
        return { ...ing, quantity: ing.quantity * scaleFactor };
      }
      return ing;
    });
    return scaledRecipe;
  }

  toCSVRow() {
    return [
      this.name,
      this.category,
      this.servings,
      this.description.replace(/[\n\r]/g, ' '),
      this.getFormattedTotalTime(),
      this.getDifficultyLabel()
    ];
  }

  getFormattedCreatedAt(locale = 'en-US') {
    return this.createdAt.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  addTag(tag) {
    if (tag && !this.tags.includes(tag)) {
      this.tags.push(tag);
      this.updatedAt = new Date();
    }
  }

  removeTag(tag) {
    this.tags = this.tags.filter(t => t !== tag);
    this.updatedAt = new Date();
  }

  archive() {
    this.isActive = false;
    this.updatedAt = new Date();
  }

  restore() {
    this.isActive = true;
    this.updatedAt = new Date();
  }

  toJSON() {
    return {
      _id: this._id,
      name: this.name,
      category: this.category,
      servings: this.servings,
      description: this.description,
      ingredients: this.ingredients,
      instructions: this.instructions,
      prepTime: this.prepTime,
      cookTime: this.cookTime,
      difficulty: this.difficulty,
      image: this.image,
      tags: this.tags,
      isActive: this.isActive,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      notes: this.notes
    };
  }

  static fromJSON(data) {
    return new Recipe(data);
  }

  static fromJSONArray(dataArray) {
    if (!Array.isArray(dataArray)) return [];
    return dataArray.map(data => Recipe.fromJSON(data));
  }

  static filterByCategory(recipes, category) {
    if (!category || category === 'all') return recipes;
    return recipes.filter(r => r.category === category);
  }

  static filterBySearch(recipes, searchTerm) {
    if (!searchTerm || searchTerm.trim().length < 3) return recipes;
    return recipes.filter(r => r.matchesSearch(searchTerm));
  }

  static filterByServings(recipes, minServings) {
    if (!minServings || minServings <= 0) return recipes;
    return recipes.filter(r => r.servings >= minServings);
  }

  static exportToCSV(recipes, filename = 'recetas_exportadas.csv') {
    if (!Array.isArray(recipes) || recipes.length === 0) return null;

    const headers = ['Nombre', 'Categoría', 'Porciones', 'Descripción', 'Tiempo Total', 'Dificultad'];
    const rows = recipes.map(r => r.toCSVRow());

    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(field => `"${field}"`).join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    return true;
  }

  clone() {
    return new Recipe(this.toJSON());
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

export default Recipe;