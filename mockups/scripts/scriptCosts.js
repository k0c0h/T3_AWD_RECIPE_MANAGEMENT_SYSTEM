
    const recipeDatabase = [
      {
        id: 1,
        name: "Piña Colada Helob",
        category: "cocktail",
        ingredients: [
          { name: "Cubo Hielo (1 Cubo)", quantity: 120, unit: "cubos", unitCost: 0.01, totalCost: 1.25 },
          { name: "Ron (1 Trago)", quantity: 25, unit: "tragos", unitCost: 0.32, totalCost: 8.00 },
          { name: "Jugo de piña", quantity: 6, unit: "oz", unitCost: 0.25, totalCost: 1.50 },
          { name: "Leche condensada", quantity: 12, unit: "oz", unitCost: 0.33, totalCost: 4.00 },
          { name: "Coco rayado", quantity: 20, unit: "g", unitCost: 0.08, totalCost: 1.50 },
          { name: "Agua", quantity: 1, unit: "oz", unitCost: 0.25, totalCost: 1.25 },
          { name: "Sorbete", quantity: 100, unit: "unidades", unitCost: 0.01, totalCost: 1.00 },
          { name: "Cereza", quantity: 50, unit: "unidades", unitCost: 0.07, totalCost: 3.50 },
          { name: "Decoración", quantity: 1, unit: "unidad", unitCost: 0.25, totalCost: 0.25 }
        ],
        indirectCosts: 1.57,
        cocktailCost: 4.71
      },
      {
        id: 2,
        name: "Pasta Carbonara",
        category: "main-course",
        ingredients: [
          { name: "Pasta", quantity: 400, unit: "g", unitCost: 0.002, totalCost: 0.80 },
          { name: "Huevos", quantity: 4, unit: "unidades", unitCost: 0.25, totalCost: 1.00 },
          { name: "Queso parmesano", quantity: 100, unit: "g", unitCost: 0.008, totalCost: 0.80 },
          { name: "Panceta", quantity: 150, unit: "g", unitCost: 0.01, totalCost: 1.50 }
        ],
        servings: 4
      },
      {
        id: 3,
        name: "Cheesecake de Fresa",
        category: "dessert",
        ingredients: [
          { name: "Queso crema", quantity: 500, unit: "g", unitCost: 0.012, totalCost: 6.00 },
          { name: "Galletas maría", quantity: 200, unit: "g", unitCost: 0.004, totalCost: 0.80 },
          { name: "Mantequilla", quantity: 100, unit: "g", unitCost: 0.008, totalCost: 0.80 },
          { name: "Azúcar", quantity: 150, unit: "g", unitCost: 0.002, totalCost: 0.30 },
          { name: "Fresas", quantity: 300, unit: "g", unitCost: 0.006, totalCost: 1.80 },
          { name: "Crema batida", quantity: 200, unit: "ml", unitCost: 0.008, totalCost: 1.60 }
        ],
        servings: 8
      },
      {
        id: 4,
        name: "Mojito Clásico",
        category: "cocktail",
        ingredients: [
          { name: "Ron blanco", quantity: 50, unit: "ml", unitCost: 0.03, totalCost: 1.50 },
          { name: "Hierbabuena", quantity: 10, unit: "hojas", unitCost: 0.05, totalCost: 0.50 },
          { name: "Limón", quantity: 1, unit: "unidad", unitCost: 0.20, totalCost: 0.20 },
          { name: "Azúcar", quantity: 2, unit: "cdas", unitCost: 0.05, totalCost: 0.10 },
          { name: "Agua con gas", quantity: 100, unit: "ml", unitCost: 0.01, totalCost: 1.00 },
          { name: "Hielo", quantity: 150, unit: "g", unitCost: 0.01, totalCost: 1.50 }
        ],
        indirectCosts: 0.85,
        cocktailCost: 2.55
      },
      {
        id: 5,
        name: "Ensalada César",
        category: "appetizer",
        ingredients: [
          { name: "Lechuga romana", quantity: 200, unit: "g", unitCost: 0.003, totalCost: 0.60 },
          { name: "Pollo", quantity: 150, unit: "g", unitCost: 0.008, totalCost: 1.20 },
          { name: "Pan", quantity: 100, unit: "g", unitCost: 0.002, totalCost: 0.20 },
          { name: "Queso parmesano", quantity: 50, unit: "g", unitCost: 0.008, totalCost: 0.40 },
          { name: "Aderezo césar", quantity: 60, unit: "ml", unitCost: 0.015, totalCost: 0.90 }
        ],
        servings: 2
      },
      {
        id: 6,
        name: "Tiramisu",
        category: "dessert",
        ingredients: [
          { name: "Queso mascarpone", quantity: 250, unit: "g", unitCost: 0.016, totalCost: 4.00 },
          { name: "Huevos", quantity: 3, unit: "unidades", unitCost: 0.25, totalCost: 0.75 },
          { name: "Azúcar", quantity: 100, unit: "g", unitCost: 0.002, totalCost: 0.20 },
          { name: "Café expreso", quantity: 200, unit: "ml", unitCost: 0.01, totalCost: 2.00 },
          { name: "Bizcochos", quantity: 200, unit: "g", unitCost: 0.006, totalCost: 1.20 },
          { name: "Cacao en polvo", quantity: 20, unit: "g", unitCost: 0.03, totalCost: 0.60 }
        ],
        servings: 6
      }
    ];

  
    let selectedRecipe = null;

 
    const searchInput = document.getElementById('searchInput');
    const dropdown = document.getElementById('dropdown');
    const recipeContent = document.getElementById('recipeContent');
    const emptyState = document.getElementById('emptyState');
    const ingredientsBody = document.getElementById('ingredientsBody');
    const indirectPercentage = document.getElementById('indirectPercentage');
    const profitMargin = document.getElementById('profitMargin');

   
    function getCategoryLabel(category) {
      const labels = {
        'cocktail': 'Cocktail',
        'dessert': 'Dessert',
        'main-course': 'Main Course',
        'appetizer': 'Appetizer'
      };
      return labels[category] || category;
    }

    function filterRecipes(searchTerm) {
      if (!searchTerm) return recipeDatabase;
      return recipeDatabase.filter(recipe =>
        recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    function calculateCosts(recipe) {
      if (!recipe) return null;

      const ingredientsCost = recipe.ingredients.reduce((sum, ing) => sum + ing.totalCost, 0);
      const indirectCostsValue = recipe.indirectCosts || (ingredientsCost * parseFloat(indirectPercentage.value) / 100);
      const totalCost = ingredientsCost + indirectCostsValue;

      let sellingPrice;
      let taxes = 0;

      if (recipe.category === 'cocktail') {
        const basePriceWithMargin = totalCost * 3;
        taxes = basePriceWithMargin * 0.25;
        sellingPrice = basePriceWithMargin + taxes;
      } else {
        sellingPrice = totalCost * (1 + parseFloat(profitMargin.value) / 100);
      }

      const costPerServing = recipe.servings ? totalCost / recipe.servings : totalCost;
      const pricePerServing = recipe.servings ? sellingPrice / recipe.servings : sellingPrice;

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

    function renderDropdown(recipes) {
      dropdown.innerHTML = '';
      if (recipes.length === 0) {
        dropdown.classList.remove('show');
        return;
      }

      recipes.forEach(recipe => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.innerHTML = `
          <span class="recipe-name">${recipe.name}</span>
          <span class="category-badge">${getCategoryLabel(recipe.category)}</span>
        `;
        item.addEventListener('click', () => selectRecipe(recipe));
        dropdown.appendChild(item);
      });

      dropdown.classList.add('show');
    }

    function selectRecipe(recipe) {
      selectedRecipe = recipe;
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
      selectedRecipe.ingredients.forEach(ingredient => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td>${ingredient.name}</td>
          <td>${ingredient.quantity} ${ingredient.unit}</td>
          <td>$${ingredient.unitCost.toFixed(2)}</td>
          <td>$${ingredient.totalCost.toFixed(2)}</td>
        `;
        ingredientsBody.appendChild(row);
      });


      const isCocktail = selectedRecipe.category === 'cocktail';
      document.getElementById('indirectCostsInput').classList.toggle('hidden', isCocktail);
      document.getElementById('cocktailFormula').classList.toggle('hidden', !isCocktail);
      document.getElementById('profitMarginInput').classList.toggle('hidden', isCocktail);


      updateCosts();
    }

    function updateCosts() {
      if (!selectedRecipe) return;

      const costs = calculateCosts(selectedRecipe);

      document.getElementById('ingredientsCost').textContent = `$${costs.ingredientsCost.toFixed(2)}`;
      document.getElementById('indirectCosts').textContent = `$${costs.indirectCosts.toFixed(2)}`;
      document.getElementById('totalCost').textContent = `$${costs.totalCost.toFixed(2)}`;

  
      const servingDiv = document.getElementById('costPerServing');
      if (selectedRecipe.servings) {
        servingDiv.classList.remove('hidden');
        document.getElementById('servingLabel').textContent = `Cost per Serving (${selectedRecipe.servings} servings):`;
        document.getElementById('servingCost').textContent = `$${costs.costPerServing.toFixed(2)}`;
      } else {
        servingDiv.classList.add('hidden');
      }


      if (selectedRecipe.category === 'cocktail' && costs.taxes > 0) {
        document.getElementById('taxesRow').classList.remove('hidden');
        document.getElementById('taxes').textContent = `$${costs.taxes.toFixed(2)}`;
      } else {
        document.getElementById('taxesRow').classList.add('hidden');
      }

   
      const priceLabel = selectedRecipe.servings ? 
        'Suggested Selling Price per Serving:' : 
        'Suggested Selling Price:';
      document.getElementById('priceLabel').textContent = priceLabel;
      
      const price = selectedRecipe.servings ? costs.pricePerServing : costs.sellingPrice;
      document.getElementById('sellingPrice').textContent = `$${price.toFixed(2)}`;
    }


    searchInput.addEventListener('input', (e) => {
      const filtered = filterRecipes(e.target.value);
      renderDropdown(filtered);
    });

    searchInput.addEventListener('focus', () => {
      const filtered = filterRecipes(searchInput.value);
      renderDropdown(filtered);
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.autocomplete-wrapper')) {
        dropdown.classList.remove('show');
      }
    });

    indirectPercentage.addEventListener('input', updateCosts);
    profitMargin.addEventListener('input', updateCosts);


    renderRecipeContent();