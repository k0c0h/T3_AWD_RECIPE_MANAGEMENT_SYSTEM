// Initial recipe data
const initialRecipes = [
    {
        id: 1,
        name: "Cuba Libre",
        category: "cocktail",
        servings: 1,
        description: "Classic refreshing Cuban cocktail",
        ingredients: [
            { name: "Ice", quantity: "", unit: "unit" },
            { name: "Rum", quantity: 1.5, unit: "oz" },
            { name: "Coca Cola", quantity: "", unit: "top" },
            { name: "Lime", quantity: 1, unit: "dash" }
        ],
        instructions: [
            "Fill a highball glass with ice",
            "Pour rum over ice",
            "Top with Coca Cola",
            "Add a dash of lime juice",
            "Stir gently and serve"
        ]
    },
    {
        id: 2,
        name: "Daiquiri (Classic)",
        category: "cocktail",
        servings: 1,
        description: "Classic Cuban rum cocktail",
        ingredients: [
            { name: "Ice", quantity: "", unit: "unit" },
            { name: "Rum", quantity: 2, unit: "oz" },
            { name: "Lime juice", quantity: 1, unit: "oz" },
            { name: "Simple syrup", quantity: 0.75, unit: "oz" }
        ],
        instructions: [
            "Add ice to a shaker",
            "Pour rum, lime juice, and simple syrup",
            "Shake vigorously for 15 seconds",
            "Strain into a chilled cocktail glass",
            "Garnish with lime wheel if desired"
        ]
    },
    {
        id: 3,
        name: "Cuban Mojito",
        category: "cocktail",
        servings: 1,
        description: "Refreshing cocktail with mint",
        ingredients: [
            { name: "Simple syrup", quantity: 0.75, unit: "oz" },
            { name: "Mint leaves", quantity: "", unit: "muddle" },
            { name: "Ice", quantity: "", unit: "unit" },
            { name: "Rum", quantity: 2, unit: "oz" },
            { name: "Lime juice", quantity: 0.75, unit: "oz" },
            { name: "Soda water", quantity: "", unit: "top" }
        ],
        instructions: [
            "Add simple syrup and mint leaves to glass",
            "Gently muddle the mint",
            "Fill glass with ice",
            "Add rum and lime juice",
            "Top with soda water",
            "Stir gently and garnish with mint sprig"
        ]
    },
    {
        id: 4,
        name: "Sex on The Beach",
        category: "cocktail",
        servings: 1,
        description: "Fruity and vibrant cocktail",
        ingredients: [
            { name: "Ice", quantity: 6, unit: "unit" },
            { name: "Vodka", quantity: 1.5, unit: "oz" },
            { name: "Peach liqueur", quantity: 1, unit: "oz" },
            { name: "Orange juice", quantity: 2, unit: "oz" },
            { name: "Cranberry juice", quantity: 2, unit: "oz" },
            { name: "Grenadine", quantity: 1, unit: "dash" }
        ],
        instructions: [
            "Fill a highball glass with ice",
            "Add vodka and peach liqueur",
            "Pour orange juice and cranberry juice",
            "Add a dash of grenadine",
            "Stir well and garnish with orange slice"
        ]
    },
    {
        id: 5,
        name: "Long Island Blue",
        category: "cocktail",
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
        ],
        instructions: [
            "Fill a tall glass with ice",
            "Add all spirits: rum, vodka, gin, triple sec, and tequila",
            "Pour Blue Curacao",
            "Add a dash of lime juice",
            "Top with Sprite",
            "Stir gently and garnish with lemon wedge"
        ]
    },
    {
        id: 6,
        name: "Blue Margarita",
        category: "cocktail",
        servings: 1,
        description: "Margarita with a blue twist",
        ingredients: [
            { name: "Ice", quantity: "", unit: "unit" },
            { name: "Triple Sec", quantity: 0.5, unit: "oz" },
            { name: "Tequila", quantity: 2, unit: "oz" },
            { name: "Blue Curacao", quantity: 1, unit: "oz" },
            { name: "Sour mix", quantity: 1.5, unit: "oz" }
        ],
        instructions: [
            "Rim glass with salt (optional)",
            "Add ice to blender",
            "Pour tequila, triple sec, blue curacao, and sour mix",
            "Blend until smooth",
            "Pour into prepared glass",
            "Garnish with lime wheel"
        ]
    },
];

// Application state
let recipes = [...initialRecipes];
let currentRecipe = null;
let ingredientCounter = 0;
let instructionCounter = 0;
let userRole = 'chef'; // Default role

// Check user role from session
function checkUserRole() {
    const session = sessionStorage.getItem('userSession');
    if (session) {
        const userData = JSON.parse(session);
        userRole = userData.role || 'chef';
        updateUIForRole();
    }
}

function updateUIForRole() {
    const btnNewRecipe = document.getElementById('btnNewRecipe');
    const headerTitle = document.getElementById('headerTitle');
    
    if (userRole === 'client') {
        // Ocultar botón de nueva receta
        if (btnNewRecipe) btnNewRecipe.style.display = 'none';
        
        // Cambiar título
        if (headerTitle) headerTitle.textContent = 'Recipe Catalog';
    }
}

// DOM Elements
const recipesGrid = document.getElementById('recipesGrid');
const recipeModal = document.getElementById('recipeModal');
const detailModal = document.getElementById('detailModal');
const recipeForm = document.getElementById('recipeForm');
const searchInput = document.getElementById('searchInput');
const filterCategory = document.getElementById('filterCategory');
const filterServings = document.getElementById('filterServings');

// Event Listeners
document.getElementById('btnNewRecipe').addEventListener('click', () => openRecipeModal());
document.getElementById('btnCloseModal').addEventListener('click', closeRecipeModal);
document.getElementById('btnCloseDetail').addEventListener('click', closeDetailModal);
document.getElementById('btnCancel').addEventListener('click', closeRecipeModal);
document.getElementById('btnAddIngredient').addEventListener('click', addIngredientField);
document.getElementById('btnAddInstruction').addEventListener('click', addInstructionField);
recipeForm.addEventListener('submit', saveRecipe);
searchInput.addEventListener('input', filterRecipes);
filterCategory.addEventListener('change', filterRecipes);
filterServings.addEventListener('change', filterRecipes);

// Main functions
function renderRecipes(recipesToRender = recipes) {
    const isClient = userRole === 'client';
    
    recipesGrid.innerHTML = recipesToRender.map(recipe => `
        <div class="recipe-card">
            <div class="recipe-header">
                <h3>${recipe.name}</h3>
                <span class="recipe-badge">${getCategoryName(recipe.category)}</span>
            </div>
            <div class="recipe-info">
                <div class="info-item">
                    <i data-lucide="users"></i>
                    <span>${recipe.servings} ${recipe.servings === 1 ? 'serving' : 'servings'}</span>
                </div>
                <div class="info-item">
                    <i data-lucide="list"></i>
                    <span>${recipe.ingredients.length} ingredients</span>
                </div>
                <div class="info-item">
                    <i data-lucide="clipboard-list"></i>
                    <span>${recipe.instructions.length} steps</span>
                </div>
            </div>
            <div class="recipe-actions">
                <button class="btn-icon" onclick="viewRecipe(${recipe.id})" title="View details">
                    <i data-lucide="eye"></i>
                </button>
                ${!isClient ? `
                <button class="btn-icon" onclick="editRecipe(${recipe.id})" title="Edit">
                    <i data-lucide="edit"></i>
                </button>
                <button class="btn-icon btn-danger" onclick="deleteRecipe(${recipe.id})" title="Delete">
                    <i data-lucide="trash-2"></i>
                </button>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    lucide.createIcons();
}

function openRecipeModal(recipe = null) {
    // Prevenir apertura si es cliente
    if (userRole === 'client') {
        alert('You do not have permission to create or edit recipes.');
        return;
    }
    
    currentRecipe = recipe;
    const modalTitle = document.getElementById('modalTitle');
    
    if (recipe) {
        modalTitle.textContent = 'Edit Recipe';
        document.getElementById('recipeName').value = recipe.name;
        document.getElementById('recipeCategory').value = recipe.category;
        document.getElementById('recipeServings').value = recipe.servings;
        document.getElementById('recipeDescription').value = recipe.description || '';
        
        // Load ingredients
        document.getElementById('ingredientsList').innerHTML = '';
        recipe.ingredients.forEach(ing => {
            addIngredientField(ing);
        });
        
        // Load instructions
        document.getElementById('instructionsList').innerHTML = '';
        recipe.instructions.forEach(instruction => {
            addInstructionField(instruction);
        });
    } else {
        modalTitle.textContent = 'New Recipe';
        recipeForm.reset();
        document.getElementById('ingredientsList').innerHTML = '';
        document.getElementById('instructionsList').innerHTML = '';
        addIngredientField();
        addInstructionField();
    }
    
    recipeModal.classList.add('active');
    lucide.createIcons();
}

function closeRecipeModal() {
    recipeModal.classList.remove('active');
    currentRecipe = null;
    ingredientCounter = 0;
    instructionCounter = 0;
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

function addInstructionField(instruction = null) {
    const instructionsList = document.getElementById('instructionsList');
    const id = instructionCounter++;
    
    const instructionDiv = document.createElement('div');
    instructionDiv.className = 'instruction-item';
    instructionDiv.innerHTML = `
        <span class="step-number">${id + 1}.</span>
        <input type="text" placeholder="Instruction step..." value="${instruction || ''}" data-field="instruction" required>
        <button type="button" class="btn-icon btn-danger" onclick="removeInstruction(this)">
            <i data-lucide="x"></i>
        </button>
    `;
    
    instructionsList.appendChild(instructionDiv);
    lucide.createIcons();
}

function removeInstruction(button) {
    const item = button.closest('.instruction-item');
    item.remove();
    updateInstructionNumbers();
}

function updateInstructionNumbers() {
    const instructions = document.querySelectorAll('.instruction-item');
    instructions.forEach((item, index) => {
        item.querySelector('.step-number').textContent = `${index + 1}.`;
    });
}

function saveRecipe(e) {
    e.preventDefault();
    
    const ingredients = Array.from(document.querySelectorAll('.ingredient-item')).map(item => ({
        name: item.querySelector('[data-field="name"]').value,
        quantity: item.querySelector('[data-field="quantity"]').value,
        unit: item.querySelector('[data-field="unit"]').value
    }));
    
    const instructions = Array.from(document.querySelectorAll('.instruction-item'))
        .map(item => item.querySelector('[data-field="instruction"]').value);
    
    if (instructions.length === 0) {
        alert('Please add at least one instruction step');
        return;
    }
    
    const recipeData = {
        id: currentRecipe?.id || Date.now(),
        name: document.getElementById('recipeName').value,
        category: document.getElementById('recipeCategory').value,
        servings: parseInt(document.getElementById('recipeServings').value),
        description: document.getElementById('recipeDescription').value,
        ingredients,
        instructions
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
        <div class="detail-section">
            <h4>Instructions</h4>
            <ol class="instructions-list">
                ${recipe.instructions.map(instruction => `
                    <li>${instruction}</li>
                `).join('')}
            </ol>
        </div>
    `;
    
    detailModal.classList.add('active');
    lucide.createIcons();
}

function closeDetailModal() {
    detailModal.classList.remove('active');
}

function editRecipe(id) {
    if (userRole === 'client') {
        alert('You do not have permission to edit recipes.');
        return;
    }
    
    const recipe = recipes.find(r => r.id === id);
    if (recipe) openRecipeModal(recipe);
}

function deleteRecipe(id) {
    if (userRole === 'client') {
        alert('You do not have permission to delete recipes.');
        return;
    }
    
    if (confirm('Are you sure you want to delete this recipe?')) {
        recipes = recipes.filter(r => r.id !== id);
        filterRecipes();
    }
}

function filterRecipes() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = filterCategory.value;
    const servingsRange = filterServings.value;
    
    const filtered = recipes.filter(recipe => {
        const matchesSearch = recipe.name.toLowerCase().includes(searchTerm) ||
                            recipe.ingredients.some(ing => ing.name.toLowerCase().includes(searchTerm));
        const matchesCategory = !category || recipe.category === category;
        
        let matchesServings = true;
        if (servingsRange) {
            if (servingsRange === '1') {
                matchesServings = recipe.servings === 1;
            } else if (servingsRange === '2-4') {
                matchesServings = recipe.servings >= 2 && recipe.servings <= 4;
            } else if (servingsRange === '5-10') {
                matchesServings = recipe.servings >= 5 && recipe.servings <= 10;
            } else if (servingsRange === '10+') {
                matchesServings = recipe.servings > 10;
            }
        }
        
        return matchesSearch && matchesCategory && matchesServings;
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
checkUserRole();
renderRecipes();
lucide.createIcons();
