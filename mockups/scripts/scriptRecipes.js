// Initial recipe data
const initialRecipes = [
    {
        id: 1,
        name: "Cuba Libre",
        category: "cocktail",
        method: "built",
        servings: 1,
        description: "Classic refreshing Cuban cocktail",
        ingredients: [
            { name: "Ice", quantity: "", unit: "unit" },
            { name: "Rum", quantity: 1.5, unit: "oz" },
            { name: "Coca Cola", quantity: "", unit: "top" },
            { name: "Lime", quantity: 1, unit: "dash" }
        ]
    },
    {
        id: 2,
        name: "Daiquiri (Classic)",
        category: "cocktail",
        method: "shaker",
        servings: 1,
        description: "Classic Cuban rum cocktail",
        ingredients: [
            { name: "Ice", quantity: "", unit: "unit" },
            { name: "Rum", quantity: 2, unit: "oz" },
            { name: "Lime juice", quantity: 1, unit: "oz" },
            { name: "Simple syrup", quantity: 0.75, unit: "oz" }
        ]
    },
    {
        id: 3,
        name: "Cuban Mojito",
        category: "cocktail",
        method: "built",
        servings: 1,
        description: "Refreshing cocktail with mint",
        ingredients: [
            { name: "Simple syrup", quantity: 0.75, unit: "oz" },
            { name: "Mint leaves", quantity: "", unit: "muddle" },
            { name: "Ice", quantity: "", unit: "unit" },
            { name: "Rum", quantity: 2, unit: "oz" },
            { name: "Lime juice", quantity: 0.75, unit: "oz" },
            { name: "Soda water", quantity: "", unit: "top" }
        ]
    },
    {
        id: 4,
        name: "Sex on The Beach",
        category: "cocktail",
        method: "built",
        servings: 1,
        description: "Fruity and vibrant cocktail",
        ingredients: [
            { name: "Ice", quantity: 6, unit: "unit" },
            { name: "Vodka", quantity: 1.5, unit: "oz" },
            { name: "Peach liqueur", quantity: 1, unit: "oz" },
            { name: "Orange juice", quantity: 2, unit: "oz" },
            { name: "Cranberry juice", quantity: 2, unit: "oz" },
            { name: "Grenadine", quantity: 1, unit: "dash" }
        ]
    },
    {
        id: 5,
        name: "Long Island Blue",
        category: "cocktail",
        method: "built",
        servings: 1,
        description: "Blue variation of the classic Long Island",
        ingredients: [
            { name: "Ice", quantity: "", unit: "unit" },
            { name: "Rum", quantity: 0.5, unit: "oz" },
            { name: "Vodka", quantity: 0.5, unit: "oz" },
            { name: "Gin", quantity: 0.5, unit: "oz" },
            { name: "Triple Sec", quantity: 0.5, unit: "oz" },
            { name: "Tequila", quantity: 0.5, unit: "oz" },
            { name: "Blue Curacao", quantity: 1, unit: "oz" },
            { name: "Sprite", quantity: "", unit: "top" },
            { name: "Lime juice", quantity: 1, unit: "dash" }
        ]
    },
    {
        id: 6,
        name: "Blue Margarita",
        category: "cocktail",
        method: "blended",
        servings: 1,
        description: "Margarita with a blue twist",
        ingredients: [
            { name: "Ice", quantity: "", unit: "unit" },
            { name: "Triple Sec", quantity: 0.5, unit: "oz" },
            { name: "Tequila", quantity: 2, unit: "oz" },
            { name: "Blue Curacao", quantity: 1, unit: "oz" },
            { name: "Sour mix", quantity: 1.5, unit: "oz" }
        ]
    },
    {
        id: 7,
        name: "White Russian",
        category: "cocktail",
        method: "built",
        servings: 1,
        description: "Creamy and smooth cocktail",
        ingredients: [
            { name: "Ice", quantity: "", unit: "unit" },
            { name: "Vodka", quantity: 1.5, unit: "oz" },
            { name: "Kahlua or coffee liqueur", quantity: 0.75, unit: "oz" },
            { name: "Heavy cream", quantity: 1, unit: "oz" }
        ]
    },
    {
        id: 8,
        name: "Grasshopper",
        category: "cocktail",
        method: "blended",
        servings: 1,
        description: "Creamy mint and cocoa cocktail",
        ingredients: [
            { name: "Ice", quantity: "", unit: "unit" },
            { name: "Creme de cacao", quantity: 1, unit: "oz" },
            { name: "Creme de menthe", quantity: 1, unit: "oz" },
            { name: "Heavy cream", quantity: 1.5, unit: "oz" },
            { name: "Condensed milk", quantity: "", unit: "to taste" }
        ]
    },
    {
        id: 9,
        name: "June Bug",
        category: "cocktail",
        method: "double_strain",
        servings: 1,
        description: "Refreshing tropical cocktail",
        ingredients: [
            { name: "Midori", quantity: 1, unit: "oz" },
            { name: "Malibu", quantity: 0.5, unit: "oz" },
            { name: "Lime juice", quantity: 1, unit: "oz" },
            { name: "Simple syrup", quantity: 0.5, unit: "oz" },
            { name: "Pineapple juice", quantity: 2, unit: "oz" }
        ]
    }
];

// Application state
let recipes = [...initialRecipes];
let currentRecipe = null;
let ingredientCounter = 0;

// DOM Elements
const recipesGrid = document.getElementById('recipesGrid');
const recipeModal = document.getElementById('recipeModal');
const detailModal = document.getElementById('detailModal');
const recipeForm = document.getElementById('recipeForm');
const searchInput = document.getElementById('searchInput');
const filterCategory = document.getElementById('filterCategory');

// Event Listeners
document.getElementById('btnNewRecipe').addEventListener('click', () => openRecipeModal());
document.getElementById('btnCloseModal').addEventListener('click', closeRecipeModal);
document.getElementById('btnCloseDetail').addEventListener('click', closeDetailModal);
document.getElementById('btnCancel').addEventListener('click', closeRecipeModal);
document.getElementById('btnAddIngredient').addEventListener('click', addIngredientField);
recipeForm.addEventListener('submit', saveRecipe);
searchInput.addEventListener('input', filterRecipes);
filterCategory.addEventListener('change', filterRecipes);

// Main functions
function renderRecipes(recipesToRender = recipes) {
    recipesGrid.innerHTML = recipesToRender.map(recipe => `
        <div class="recipe-card">
            <div class="recipe-header">
                <h3>${recipe.name}</h3>
                <span class="recipe-badge">${getCategoryName(recipe.category)}</span>
            </div>
            <div class="recipe-info">
                <div class="info-item">
                    <i data-lucide="chef-hat"></i>
                    <span>${recipe.method}</span>
                </div>
                <div class="info-item">
                    <i data-lucide="users"></i>
                    <span>${recipe.servings} ${recipe.servings === 1 ? 'serving' : 'servings'}</span>
                </div>
                <div class="info-item">
                    <i data-lucide="list"></i>
                    <span>${recipe.ingredients.length} ingredients</span>
                </div>
            </div>
            <div class="recipe-actions">
                <button class="btn-icon" onclick="viewRecipe(${recipe.id})" title="View details">
                    <i data-lucide="eye"></i>
                </button>
                <button class="btn-icon" onclick="editRecipe(${recipe.id})" title="Edit">
                    <i data-lucide="edit"></i>
                </button>
                <button class="btn-icon btn-danger" onclick="deleteRecipe(${recipe.id})" title="Delete">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    lucide.createIcons();
}

function openRecipeModal(recipe = null) {
    currentRecipe = recipe;
    const modalTitle = document.getElementById('modalTitle');
    
    if (recipe) {
        modalTitle.textContent = 'Edit Recipe';
        document.getElementById('recipeName').value = recipe.name;
        document.getElementById('recipeCategory').value = recipe.category;
        document.getElementById('recipeServings').value = recipe.servings;
        document.getElementById('recipeMethod').value = recipe.method;
        document.getElementById('recipeDescription').value = recipe.description || '';
        
        // Load ingredients
        document.getElementById('ingredientsList').innerHTML = '';
        recipe.ingredients.forEach(ing => {
            addIngredientField(ing);
        });
    } else {
        modalTitle.textContent = 'New Recipe';
        recipeForm.reset();
        document.getElementById('ingredientsList').innerHTML = '';
        addIngredientField();
    }
    
    recipeModal.classList.add('active');
    lucide.createIcons();
}

function closeRecipeModal() {
    recipeModal.classList.remove('active');
    currentRecipe = null;
    ingredientCounter = 0;
}

function addIngredientField(ingredient = null) {
    const ingredientsList = document.getElementById('ingredientsList');
    const id = ingredientCounter++;
    
    const ingredientDiv = document.createElement('div');
    ingredientDiv.className = 'ingredient-item';
    ingredientDiv.innerHTML = `
        <input type="text" placeholder="Ingredient" value="${ingredient?.name || ''}" data-field="name" required>
        <input type="number" step="0.01" placeholder="Quantity" value="${ingredient?.quantity || ''}" data-field="quantity">
        <select data-field="unit" required>
            <option value="oz" ${ingredient?.unit === 'oz' ? 'selected' : ''}>Ounces (oz)</option>
            <option value="ml" ${ingredient?.unit === 'ml' ? 'selected' : ''}>Milliliters (ml)</option>
            <option value="cup" ${ingredient?.unit === 'cup' ? 'selected' : ''}>Cups</option>
            <option value="tbsp" ${ingredient?.unit === 'tbsp' ? 'selected' : ''}>Tablespoons</option>
            <option value="tsp" ${ingredient?.unit === 'tsp' ? 'selected' : ''}>Teaspoons</option>
            <option value="dash" ${ingredient?.unit === 'dash' ? 'selected' : ''}>Dash</option>
            <option value="g" ${ingredient?.unit === 'g' ? 'selected' : ''}>Grams (g)</option>
            <option value="unit" ${ingredient?.unit === 'unit' ? 'selected' : ''}>Unit</option>
            <option value="top" ${ingredient?.unit === 'top' ? 'selected' : ''}>Top</option>
            <option value="muddle" ${ingredient?.unit === 'muddle' ? 'selected' : ''}>Muddle</option>
            <option value="to taste" ${ingredient?.unit === 'to taste' ? 'selected' : ''}>To taste</option>
        </select>
        <button type="button" class="btn-icon btn-danger" onclick="removeIngredient(this)">
            <i data-lucide="x"></i>
        </button>
    `;
    
    ingredientsList.appendChild(ingredientDiv);
    lucide.createIcons();
}

function removeIngredient(button) {
    button.closest('.ingredient-item').remove();
}

function saveRecipe(e) {
    e.preventDefault();
    
    const ingredients = Array.from(document.querySelectorAll('.ingredient-item')).map(item => ({
        name: item.querySelector('[data-field="name"]').value,
        quantity: item.querySelector('[data-field="quantity"]').value,
        unit: item.querySelector('[data-field="unit"]').value
    }));
    
    const recipeData = {
        id: currentRecipe?.id || Date.now(),
        name: document.getElementById('recipeName').value,
        category: document.getElementById('recipeCategory').value,
        servings: parseInt(document.getElementById('recipeServings').value),
        method: document.getElementById('recipeMethod').value,
        description: document.getElementById('recipeDescription').value,
        ingredients
    };
    
    if (currentRecipe) {
        const index = recipes.findIndex(r => r.id === currentRecipe.id);
        recipes[index] = recipeData;
    } else {
        recipes.push(recipeData);
    }
    
    closeRecipeModal();
    filterRecipes();
}

function viewRecipe(id) {
    const recipe = recipes.find(r => r.id === id);
    if (!recipe) return;
    
    document.getElementById('detailRecipeName').textContent = recipe.name;
    document.getElementById('recipeDetail').innerHTML = `
        <div class="detail-section">
            <h4>General Information</h4>
            <p><strong>Type:</strong> ${getCategoryName(recipe.category)}</p>
            <p><strong>Method:</strong> ${recipe.method}</p>
            <p><strong>Yield:</strong> ${recipe.servings} ${recipe.servings === 1 ? 'serving' : 'servings'}</p>
            ${recipe.description ? `<p><strong>Description:</strong> ${recipe.description}</p>` : ''}
        </div>
        <div class="detail-section">
            <h4>Ingredients</h4>
            <ul class="ingredients-list">
                ${recipe.ingredients.map(ing => `
                    <li>${ing.quantity ? ing.quantity + ' ' : ''}${getUnitName(ing.unit)} ${ing.name}</li>
                `).join('')}
            </ul>
        </div>
    `;
    
    detailModal.classList.add('active');
    lucide.createIcons();
}

function closeDetailModal() {
    detailModal.classList.remove('active');
}

function editRecipe(id) {
    const recipe = recipes.find(r => r.id === id);
    if (recipe) openRecipeModal(recipe);
}

function deleteRecipe(id) {
    if (confirm('Are you sure you want to delete this recipe?')) {
        recipes = recipes.filter(r => r.id !== id);
        filterRecipes();
    }
}

function filterRecipes() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = filterCategory.value;
    
    const filtered = recipes.filter(recipe => {
        const matchesSearch = recipe.name.toLowerCase().includes(searchTerm) ||
                            recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchTerm));
        const matchesCategory = !category || recipe.category === category;
        
        return matchesSearch && matchesCategory;
    });
    
    renderRecipes(filtered);
}

function getCategoryName(category) {
    const categories = {
        'cocktail': 'Cocktail',
        'appetizer': 'Appetizer',
        'main_course': 'Main Course',
        'dessert': 'Dessert',
        'beverage': 'Beverage'
    };
    return categories[category] || category;
}

function getUnitName(unit) {
    const units = {
        'oz': 'oz',
        'ml': 'ml',
        'cup': 'cup(s)',
        'tbsp': 'tablespoon(s)',
        'tsp': 'teaspoon(s)',
        'dash': 'dash',
        'g': 'g',
        'unit': '',
        'top': '',
        'muddle': '',
        'to taste': ''
    };
    return units[unit] || unit;
}

// Initialize
renderRecipes();
lucide.createIcons();
