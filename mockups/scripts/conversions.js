// Conversion factors (to grams or milliliters as base)
const conversionRates = {
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
  ml: 1,
  l: 1000
};

const inputValue = document.getElementById("inputValue");
const inputUnit = document.getElementById("inputUnit");
const outputUnit = document.getElementById("outputUnit");
const resultValue = document.getElementById("resultValue");
const btnConvert = document.getElementById("btnConvert");

function convertUnits() {
  const value = parseFloat(inputValue.value);
  const from = inputUnit.value;
  const to = outputUnit.value;

  if (isNaN(value) || value < 0) {
    resultValue.value = "Invalid input";
    return;
  }

  if (from === to) {
    resultValue.value = value.toFixed(3);
    return;
  }

  const base = value * conversionRates[from];
  const converted = base / conversionRates[to];
  resultValue.value = converted.toFixed(3);
}

// Convert on button click or on changes
btnConvert.addEventListener("click", convertUnits);
[inputValue, inputUnit, outputUnit].forEach(el =>
  el.addEventListener("input", convertUnits)
);
