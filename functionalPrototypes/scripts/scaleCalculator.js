const recipes = [
  {
    id: 1,
    name: "Cuba Libre",
    servings: 1,
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
    servings: 1,
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
    servings: 1,
    ingredients: [
      { name: "Simple syrup", quantity: 0.75, unit: "oz" },
      { name: "Mint leaves", quantity: "", unit: "muddle" },
      { name: "Rum", quantity: 2, unit: "oz" },
      { name: "Lime juice", quantity: 0.75, unit: "oz" },
      { name: "Soda water", quantity: "", unit: "top" }
    ]
  },
  {
    id: 4,
    name: "Sex on The Beach",
    servings: 1,
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
    name: "Blue Margarita",
    servings: 1,
    ingredients: [
      { name: "Triple Sec", quantity: 0.5, unit: "oz" },
      { name: "Tequila", quantity: 2, unit: "oz" },
      { name: "Blue Curacao", quantity: 1, unit: "oz" },
      { name: "Sour mix", quantity: 1.5, unit: "oz" }
    ]
  }
];

const bottleSizes = {
  Vodka: 25.36,
  Rum: 25.36,
  Tequila: 25.36,
  "Triple Sec": 25.36,
  "Peach liqueur": 25.36,
  "Blue Curacao": 25.36
};

const recipeSelect = document.querySelector("select");
const originalYieldInput = document.getElementById("originalYield");
const newServingsInput = document.getElementById("newServings");
const scaleFactorInput = document.getElementById("scaleFactor");
const ingredientsBody = document.getElementById("ingredientsBody");
const calculateBtn = document.getElementById("btnCalculate");

window.addEventListener("DOMContentLoaded", () => {
  recipes.forEach((recipe) => {
    const option = document.createElement("option");
    option.value = recipe.id;
    option.textContent = recipe.name;
    recipeSelect.appendChild(option);
  });
});

recipeSelect.addEventListener("change", (e) => {
  const recipe = recipes.find((r) => r.id == e.target.value);
  if (!recipe) return;

  originalYieldInput.value = recipe.servings;
  newServingsInput.value = recipe.servings;
  scaleFactorInput.value = 1;

  renderIngredients(recipe, 1);
});

function renderIngredients(recipe, factor) {
  ingredientsBody.innerHTML = recipe.ingredients
    .map((ing) => {
      const scaledQty =
        ing.quantity && !isNaN(ing.quantity)
          ? (ing.quantity * factor).toFixed(2)
          : ing.quantity || "";

      let bottleInfo = "";
      if (bottleSizes[ing.name] && scaledQty) {
        const neededBottles = Math.ceil(scaledQty / bottleSizes[ing.name]);
        bottleInfo = ` (≈ ${neededBottles} bottle${neededBottles > 1 ? "s" : ""})`;
      }

      return `
        <tr>
          <td>${ing.name}</td>
          <td>${ing.quantity ? ing.quantity + " " + ing.unit : ing.unit}</td>
          <td>${scaledQty ? scaledQty + " " + ing.unit + bottleInfo : ing.unit}</td>
        </tr>
      `;
    })
    .join("");
}

calculateBtn.addEventListener("click", () => {
  const recipe = recipes.find((r) => r.id == recipeSelect.value);
  if (!recipe) {
    alert("Please select a recipe first.");
    return;
  }

  const original = parseFloat(originalYieldInput.value);
  const desired = parseFloat(newServingsInput.value);
  if (isNaN(original) || isNaN(desired) || original <= 0 || desired <= 0) {
    alert("Enter valid serving values.");
    return;
  }

  const factor = desired / original;
  scaleFactorInput.value = factor.toFixed(2);

  renderIngredients(recipe, factor);
});
