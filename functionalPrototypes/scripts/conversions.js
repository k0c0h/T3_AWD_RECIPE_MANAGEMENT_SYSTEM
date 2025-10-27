const conversionRates = {
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
  ml: 1,
  l: 1000,
  cup: 240,
  tbsp: 15,
  tsp: 5
};

const inputValue = document.getElementById("inputValue");
const inputUnit = document.getElementById("inputUnit");
const outputUnit = document.getElementById("outputUnit");
const resultValue = document.getElementById("resultValue");
const btnConvert = document.getElementById("btnConvert");

function roundFraction(num) {
  const whole = Math.floor(num);
  const fraction = num - whole;
  let fracText = "";
  if (fraction >= 0.75) fracText = "¾";
  else if (fraction >= 0.5) fracText = "½";
  else if (fraction >= 0.25) fracText = "¼";
  return whole > 0 ? `${whole}${fracText}` : `${fracText}`;
}

function formatKitchenUnits(valueInMl) {
  let remaining = valueInMl;
  const parts = [];

  const cup = Math.floor(remaining / conversionRates["cup"]);
  if (cup) {
    parts.push(`${cup} cup${cup > 1 ? 's' : ''}`);
    remaining -= cup * conversionRates["cup"];
  }

  let tbsp = remaining / conversionRates["tbsp"];
  if (tbsp >= 0.25) {
    const tbspFrac = roundFraction(tbsp);
    parts.push(`${tbspFrac} tbsp`);
    remaining -= parseFloat(tbspFrac.replace(/[^\d.]/g, '')) * conversionRates["tbsp"];
  }

  let tsp = remaining / conversionRates["tsp"];
  if (tsp >= 0.25) {
    const tspFrac = roundFraction(tsp);
    parts.push(`${tspFrac} tsp`);
    remaining -= parseFloat(tspFrac.replace(/[^\d.]/g, '')) * conversionRates["tsp"];
  }

  return parts.join(' + ') || '0 tsp';
}

function convertUnits() {
  const value = parseFloat(inputValue.value);
  const from = inputUnit.value;
  const to = outputUnit.value;

  if (isNaN(value) || value < 0) {
    resultValue.value = "Invalid input";
    return;
  }

  const base = value * conversionRates[from];
  let converted = base / conversionRates[to];

  if (to === "kitchen") {
    resultValue.value = formatKitchenUnits(base);
  } else {
    resultValue.value = converted.toFixed(2) + " " + to;
  }
}

btnConvert.addEventListener("click", convertUnits);
[inputValue, inputUnit, outputUnit].forEach(el =>
  el.addEventListener("input", convertUnits)
);
window.addEventListener("DOMContentLoaded", convertUnits);
