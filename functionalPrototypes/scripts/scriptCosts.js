const API_URL = window.API_URL || 'http://localhost:5000/api';

let selectedRecipe = null;
let recipeIngredients = []; 
let allIngredients = [];

// DOM elements
const searchInput = document.getElementById('searchInput');
const dropdown = document.getElementById('dropdown');
const recipeContent = document.getElementById('recipeContent');
const emptyState = document.getElementById('emptyState');
const ingredientsBody = document.getElementById('ingredientsBody');
const indirectPercentage = document.getElementById('indirectPercentage');
const profitMargin = document.getElementById('profitMargin');

function normalizeMongoData(data) {
  if (Array.isArray(data)) {
    return data.map(item => normalizeMongoData(item));
  }
  
  if (data && typeof data === 'object') {
    const normalized = {};
    for (const [key, value] of Object.entries(data)) {
      const cleanKey = key.trim();

      if (value && typeof value === 'object') {
        if (value.$numberInt) {
          normalized[cleanKey] = parseInt(value.$numberInt);
        } else if (value.$numberDouble) {
          normalized[cleanKey] = parseFloat(value.$numberDouble);
        } else if (value.$oid) {
          normalized[cleanKey] = value.$oid;
        } else {
          normalized[cleanKey] = normalizeMongoData(value);
        }
      } else {
        normalized[cleanKey] = value;
      }
    }
    return normalized;
  }
  
  return data;
}

async function loadAllIngredients() {
  try {
    const response = await fetch(`${API_URL}/ingredients`);
    if (!response.ok) throw new Error('Network error');
    const data = await response.json();
    allIngredients = normalizeMongoData(data);
    console.log('Ingredientes cargados:', allIngredients);
  } catch (error) {
    console.error('Error loading ingredients:', error);
    allIngredients = [];
  }
}

async function loadRecipes(searchTerm = '') {
  try {
    const response = await fetch(`${API_URL}/recipes`);
    if (!response.ok) throw new Error('Network error');
    const data = await response.json();
    const recipes = normalizeMongoData(data);
    
    if (!searchTerm) return recipes;
    return recipes.filter(recipe =>
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  } catch (error) {
    console.error('Error loading recipes:', error);
    return [];
  }
}

function getCategoryLabel(category) {
  const labels = {
    'cocktail': 'Cocktail',
    'dessert': 'Dessert',
    'main-course': 'Main Course',
    'appetizer': 'Appetizer',
    'beverage': 'Beverage'
  };
  return labels[category] || category;
}

function getIngredientAlternatives(ingredientName) {
  const normalizedName = ingredientName.trim().toLowerCase();
  
  const alternatives = allIngredients.filter(ing => {
    const ingName = (ing.name || '').trim().toLowerCase();
    return ingName === normalizedName;
  });
  
  return alternatives;
}

function calculateIngredientCost(ingredient, productId, quantity) {
  let product = allIngredients.find(p => p.productId === productId);

  if (!product) {
    const normalizedName = ingredient.trim().toLowerCase();
    product = allIngredients.find(p => 
      (p.name || '').trim().toLowerCase() === normalizedName
    );
  }
 
  if (!product) {
    console.error(`Producto no encontrado: ${productId} / ${ingredient}`);
    console.error('ProductIds disponibles:', allIngredients.map(i => i.productId));
    return { unitCost: 0, totalCost: 0 };
  }
  const unitCost = product.price / product.size;
  const totalCost = quantity * unitCost;
  return {
    unitCost,
    totalCost,
    product
  };
}

function calculateCosts() {
  if (!recipeIngredients.length) return null;

  const ingredientsCost = recipeIngredients.reduce((sum, ing) => {
    const cost = calculateIngredientCost(
      ing.ingredientName,
      ing.productId,
      ing.quantity,
      ing.unit
    );
    return sum + cost.totalCost;
  }, 0);

  const indirectCostsValue = ingredientsCost * (parseFloat(indirectPercentage.value) || 0) / 100;
  const totalCost = ingredientsCost + indirectCostsValue;

  let sellingPrice;
  let taxes = 0;

  // Usar 'type' en lugar de 'category' para cocktails
  const recipeType = selectedRecipe.type || selectedRecipe.category;
  
  if (recipeType === 'cocktail') {
    // Read user-entered tax parts (defaults provided in the DOM)
    const tax15 = parseFloat(document.getElementById('tax15')?.value) || 0;
    const tax10 = parseFloat(document.getElementById('tax10')?.value) || 0;
    const totalTaxPercent = (tax15 + tax10) / 100;

    const basePriceWithMargin = totalCost * 3;
    taxes = basePriceWithMargin * totalTaxPercent;
    sellingPrice = basePriceWithMargin + taxes;
  } else {
    sellingPrice = totalCost * (1 + (parseFloat(profitMargin.value) || 0) / 100);
  }

  const costPerServing = selectedRecipe.servings ? totalCost / selectedRecipe.servings : totalCost;
  const pricePerServing = selectedRecipe.servings ? sellingPrice / selectedRecipe.servings : sellingPrice;

  return {
    ingredientsCost,
    indirectCosts: indirectCostsValue,
    totalCost,
    costPerServing,
    sellingPrice,
    pricePerServing,
    taxes
  };
}

async function renderDropdown(searchTerm) {
  const recipes = await loadRecipes(searchTerm);
  dropdown.innerHTML = '';
  
  if (recipes.length === 0) {
    dropdown.classList.remove('show');
    return;
  }

  recipes.forEach(recipe => {
    const item = document.createElement('div');
    item.className = 'dropdown-item';
    const recipeType = recipe.type || recipe.category || 'unknown';
    item.innerHTML = `
      <span class="recipe-name">${recipe.name}</span>
      <span class="category-badge">${getCategoryLabel(recipeType)}</span>
    `;
    item.addEventListener('click', () => selectRecipe(recipe));
    dropdown.appendChild(item);
  });

  dropdown.classList.add('show');
}

function selectRecipe(recipe) {
  selectedRecipe = recipe;
  recipeIngredients = JSON.parse(JSON.stringify(recipe.ingredients));
  searchInput.value = recipe.name;
  dropdown.classList.remove('show');
  renderRecipeContent();
}

function renderRecipeContent() {
  if (!selectedRecipe) {
    recipeContent.classList.add('hidden');
    emptyState.classList.remove('hidden');
    return;
  }

  emptyState.classList.add('hidden');
  recipeContent.classList.remove('hidden');
  ingredientsBody.innerHTML = '';
  
  recipeIngredients.forEach((ingredient, index) => {
    const cost = calculateIngredientCost(
      ingredient.ingredientName,
      ingredient.productId,
      ingredient.quantity,
      ingredient.unit
    );
    
    const alternatives = getIngredientAlternatives(ingredient.ingredientName);
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <strong>${ingredient.ingredientName}</strong>
          <select class="product-select" data-index="${index}">
            ${alternatives.length > 0 ? alternatives.map(alt => `
              <option value="${alt.productId}" ${alt.productId === ingredient.productId ? 'selected' : ''}>
                ${alt.brand} - $${alt.price.toFixed(2)}/${alt.size}${alt.sizeUnit}
                ${alt.supplier ? `(${alt.supplier})` : ''}
              </option>
            `).join('') : `<option value="${ingredient.productId}">No disponible</option>`}
          </select>
        </div>
      </td>
      <td>
        <input 
          type="number" 
          class="quantity-input" 
          data-index="${index}"
          value="${ingredient.quantity}" 
          min="0" 
          step="0.1"
        />
        <span>${ingredient.unit}</span>
      </td>
      <td>$${cost.unitCost.toFixed(4)}</td>
      <td>$${cost.totalCost.toFixed(2)}</td>
    `;
    ingredientsBody.appendChild(row);
  });

  document.querySelectorAll('.product-select').forEach(select => {
    select.addEventListener('change', (e) => {
      const index = parseInt(e.target.dataset.index);
      recipeIngredients[index].productId = e.target.value;
      updateIngredientRow(index);
      updateCostsDisplay();
      highlightChangedRow(index);
    });
  });

  document.querySelectorAll('.quantity-input').forEach(input => {
    input.addEventListener('input', (e) => {
      const index = parseInt(e.target.dataset.index);
      recipeIngredients[index].quantity = parseFloat(e.target.value) || 0;
      updateIngredientRow(index);
      updateCostsDisplay();
      highlightChangedRow(index);
    });
  });

  const recipeType = selectedRecipe.type || selectedRecipe.category;
  const isCocktail = recipeType === 'cocktail';
  
  document.getElementById('indirectCostsInput').classList.toggle('hidden', isCocktail);
  document.getElementById('cocktailFormula').classList.toggle('hidden', !isCocktail);
  document.getElementById('profitMarginInput').classList.toggle('hidden', isCocktail);

  updateCostsDisplay();
}

function highlightChangedRow(index) {
  const rows = ingredientsBody.querySelectorAll('tr');
  if (rows[index]) {
    rows[index].style.backgroundColor = '#fff3cd';
    setTimeout(() => {
      rows[index].style.backgroundColor = '';
    }, 1000);
  }
}

function updateIngredientRow(index) {
  const ingredient = recipeIngredients[index];
  const cost = calculateIngredientCost(
    ingredient.ingredientName,
    ingredient.productId,
    ingredient.quantity,
    ingredient.unit
  );
  
  const rows = ingredientsBody.querySelectorAll('tr');
  if (rows[index]) {
    const unitCostCell = rows[index].cells[2];
    const totalCostCell = rows[index].cells[3];
    
    unitCostCell.textContent = `${cost.unitCost.toFixed(4)}`;
    totalCostCell.textContent = `${cost.totalCost.toFixed(2)}`;
  }
}

function updateCostsDisplay() {
  if (!selectedRecipe) return;

  const costs = calculateCosts();
  if (!costs) return;
  document.getElementById('ingredientsCost').textContent = `$${costs.ingredientsCost.toFixed(2)}`;
  document.getElementById('indirectCosts').textContent = `$${costs.indirectCosts.toFixed(2)}`;
  document.getElementById('totalCost').textContent = `$${costs.totalCost.toFixed(2)}`;

  const servingDiv = document.getElementById('costPerServing');
  if (selectedRecipe.servings) {
    servingDiv.classList.remove('hidden');
    document.getElementById('servingLabel').textContent = 
      `Cost per Serving (${selectedRecipe.servings} servings):`;
    document.getElementById('servingCost').textContent = 
      `$${costs.costPerServing.toFixed(2)}`;
  } else {
    servingDiv.classList.add('hidden');
  }

  const recipeType = selectedRecipe.type || selectedRecipe.category;
  if (recipeType === 'cocktail') {
    const tax15 = parseFloat(document.getElementById('tax15')?.value) || 0;
    const tax10 = parseFloat(document.getElementById('tax10')?.value) || 0;
    document.getElementById('taxesBreakdown').textContent = `${tax15}% + ${tax10}%`;
    document.getElementById('taxesRow').classList.remove('hidden');
    document.getElementById('taxes').textContent = `$${costs.taxes.toFixed(2)}`;
  } else {
    document.getElementById('taxesRow').classList.add('hidden');
  }

  // Update price labels and values
  const priceLabel = selectedRecipe.servings ? 
    'Suggested Selling Price per Serving:' : 
    'Suggested Selling Price:';
  document.getElementById('priceLabel').textContent = priceLabel;
  
  const price = selectedRecipe.servings ? costs.pricePerServing : costs.sellingPrice;
  document.getElementById('sellingPrice').textContent = `$${price.toFixed(2)}`;
}

// Event Listeners
searchInput.addEventListener('input', (e) => renderDropdown(e.target.value));
searchInput.addEventListener('focus', () => renderDropdown(searchInput.value));
document.addEventListener('click', (e) => {
  if (!e.target.closest('.autocomplete-wrapper')) {
    dropdown.classList.remove('show');
  }
});
indirectPercentage.addEventListener('input', updateCostsDisplay);
profitMargin.addEventListener('input', updateCostsDisplay);

// Tax inputs (for cocktails) should also trigger recalculation
const tax15Input = document.getElementById('tax15');
const tax10Input = document.getElementById('tax10');
if (tax15Input) tax15Input.addEventListener('input', updateCostsDisplay);
if (tax10Input) tax10Input.addEventListener('input', updateCostsDisplay);

// Initialize
loadAllIngredients();
renderRecipeContent();