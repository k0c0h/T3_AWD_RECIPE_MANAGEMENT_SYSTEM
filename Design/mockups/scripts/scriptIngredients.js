// Initial ingredient data
let ingredients = [
    { id: 1, name: "Rum", category: "spirit", product: "Bacardi Superior", size: "750ml", price: 18.99, units: ["oz", "ml"] },
    { id: 2, name: "Vodka", category: "spirit", product: "Absolut Vodka", size: "1 liter", price: 24.99, units: ["oz", "ml"] },
    { id: 3, name: "Tequila", category: "spirit", product: "Jose Cuervo Silver", size: "750ml", price: 19.99, units: ["oz", "ml"] },
    { id: 4, name: "Gin", category: "spirit", product: "Beefeater", size: "750ml", price: 21.99, units: ["oz", "ml"] },
    { id: 5, name: "Triple Sec", category: "spirit", product: "Cointreau", size: "750ml", price: 29.99, units: ["oz", "ml"] },
    { id: 6, name: "Blue Curacao", category: "spirit", product: "Bols Blue", size: "750ml", price: 15.99, units: ["oz", "ml"] },
    { id: 7, name: "Kahlua", category: "spirit", product: "Kahlua Coffee Liqueur", size: "750ml", price: 22.99, units: ["oz", "ml"] },
    { id: 8, name: "Midori", category: "spirit", product: "Midori Melon Liqueur", size: "750ml", price: 18.99, units: ["oz", "ml"] },
    { id: 9, name: "Malibu", category: "spirit", product: "Malibu Coconut Rum", size: "750ml", price: 17.99, units: ["oz", "ml"] },
    { id: 10, name: "Creme de cacao", category: "spirit", product: "Bols Dark Creme de Cacao", size: "750ml", price: 14.99, units: ["oz", "ml"] },
    { id: 11, name: "Creme de menthe", category: "spirit", product: "Bols Peppermint White", size: "750ml", price: 14.99, units: ["oz", "ml"] },
    { id: 12, name: "Peach liqueur", category: "spirit", product: "DeKuyper Peachtree", size: "750ml", price: 12.99, units: ["oz", "ml"] },
    { id: 13, name: "Coca Cola", category: "mixer", product: "Coca-Cola Classic", size: "2 liters", price: 2.49, units: ["ml", "oz"] },
    { id: 14, name: "Sprite", category: "mixer", product: "Sprite", size: "2 liters", price: 2.49, units: ["ml", "oz"] },
    { id: 15, name: "Soda water", category: "mixer", product: "Club Soda", size: "1 liter", price: 1.99, units: ["ml", "oz"] }
];

let currentIngredient = null;

// DOM Elements
const ingredientsBody = document.getElementById('ingredientsBody');
const ingredientModal = document.getElementById('ingredientModal');
const ingredientForm = document.getElementById('ingredientForm');
const searchIngredient = document.getElementById('searchIngredient');
const filterCategory = document.getElementById('filterCategory');

// Event Listeners
document.getElementById('btnNewIngredient').addEventListener('click', () => openIngredientModal());
document.getElementById('btnCloseModal').addEventListener('click', closeIngredientModal);
document.getElementById('btnCancel').addEventListener('click', closeIngredientModal);
ingredientForm.addEventListener('submit', saveIngredient);
searchIngredient.addEventListener('input', filterIngredients);
filterCategory.addEventListener('change', filterIngredients);

// Functions
function renderIngredients(ingredientsToRender = ingredients) {
    ingredientsBody.innerHTML = ingredientsToRender.map(ingredient => `
        <tr>
            <td>${ingredient.name}</td>
            <td><span class="category-badge">${getCategoryName(ingredient.category)}</span></td>
            <td>${ingredient.product}</td>
            <td>${ingredient.size}</td>
            <td>$${ingredient.price.toFixed(2)}</td>
            <td>${ingredient.units.join(', ')}</td>
            <td>
                <button class="btn-icon" onclick="editIngredient(${ingredient.id})" title="Edit">
                    <i data-lucide="edit"></i>
                </button>
                <button class="btn-icon btn-danger" onclick="deleteIngredient(${ingredient.id})" title="Delete">
                    <i data-lucide="trash-2"></i>
                </button>
            </td>
        </tr>
    `).join('');
    
    lucide.createIcons();
}

function openIngredientModal(ingredient = null) {
    currentIngredient = ingredient;
    const modalTitle = document.getElementById('modalTitle');
    
    if (ingredient) {
        modalTitle.textContent = 'Edit Ingredient';
        document.getElementById('ingredientName').value = ingredient.name;
        document.getElementById('ingredientCategory').value = ingredient.category;
        document.getElementById('productBrand').value = ingredient.product;
        document.getElementById('productSize').value = ingredient.size;
        document.getElementById('productPrice').value = ingredient.price;
        
        // Check units
        document.querySelectorAll('input[name="units"]').forEach(checkbox => {
            checkbox.checked = ingredient.units.includes(checkbox.value);
        });
    } else {
        modalTitle.textContent = 'New Ingredient';
        ingredientForm.reset();
    }
    
    ingredientModal.classList.add('active');
}

function closeIngredientModal() {
    ingredientModal.classList.remove('active');
    currentIngredient = null;
}

function saveIngredient(e) {
    e.preventDefault();
    
    const selectedUnits = Array.from(document.querySelectorAll('input[name="units"]:checked'))
        .map(cb => cb.value);
    
    if (selectedUnits.length === 0) {
        alert('Please select at least one measurement unit');
        return;
    }
    
    const ingredientData = {
        id: currentIngredient?.id || Date.now(),
        name: document.getElementById('ingredientName').value,
        category: document.getElementById('ingredientCategory').value,
        product: document.getElementById('productBrand').value,
        size: document.getElementById('productSize').value,
        price: parseFloat(document.getElementById('productPrice').value),
        units: selectedUnits
    };
    
    if (currentIngredient) {
        const index = ingredients.findIndex(i => i.id === currentIngredient.id);
        ingredients[index] = ingredientData;
    } else {
        ingredients.push(ingredientData);
    }
    
    closeIngredientModal();
    filterIngredients();
}

function editIngredient(id) {
    const ingredient = ingredients.find(i => i.id === id);
    if (ingredient) openIngredientModal(ingredient);
}

function deleteIngredient(id) {
    if (confirm('Are you sure you want to delete this ingredient?')) {
        ingredients = ingredients.filter(i => i.id !== id);
        filterIngredients();
    }
}

function filterIngredients() {
    const searchTerm = searchIngredient.value.toLowerCase();
    const category = filterCategory.value;
    
    const filtered = ingredients.filter(ingredient => {
        const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm) ||
                            ingredient.product.toLowerCase().includes(searchTerm);
        const matchesCategory = !category || ingredient.category === category;
        
        return matchesSearch && matchesCategory;
    });
    
    renderIngredients(filtered);
}

function getCategoryName(category) {
    const categories = {
        'spirit': 'Spirit',
        'mixer': 'Mixer',
        'juice': 'Juice',
        'syrup': 'Syrup',
        'garnish': 'Garnish',
        'other': 'Other'
    };
    return categories[category] || category;
}

// Initialize
renderIngredients();
lucide.createIcons();
