const Unit = require('../models/units');

async function convert(value, from, to, density = 1) {
    const fromUnit = await Unit.findOne({ name: from, isActive: true });
    const toUnit = await Unit.findOne({ name: to, isActive: true });

    if (!fromUnit || !toUnit) {
        throw new Error('Unit not found');
    }

    if (fromUnit.type === toUnit.type) {
        return (value * fromUnit.toBase) / toUnit.toBase;
    }

    if (fromUnit.type === 'weight' && toUnit.type === 'volume') {
        const grams = value * fromUnit.toBase;
        const ml = grams / density;
        return ml / toUnit.toBase;
    }

    if (fromUnit.type === 'volume' && toUnit.type === 'weight') {
        const ml = value * fromUnit.toBase;
        const grams = ml * density;
        return grams / toUnit.toBase;
    }

    throw new Error('Unsupported conversion type');
}

function formatKitchenUnits(valueInMl) {
    const cup = 240;
    const tbsp = 15;
    const tsp = 5;

    let remaining = valueInMl;
    const parts = [];

    const cups = Math.floor(remaining / cup);
    if (cups) {
        parts.push(`${cups} cup${cups > 1 ? 's' : ''}`);
        remaining -= cups * cup;
    }

    const tbsps = Math.floor(remaining / tbsp);
    if (tbsps) {
        parts.push(`${tbsps} tbsp`);
        remaining -= tbsps * tbsp;
    }

    const tsps = Math.round(remaining / tsp);
    if (tsps) {
        parts.push(`${tsps} tsp`);
    }

    return parts.join(' + ') || '0 tsp';
}

module.exports = { convert, formatKitchenUnits };
