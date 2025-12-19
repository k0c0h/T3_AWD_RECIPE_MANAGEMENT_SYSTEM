const express = require('express');
const router = express.Router();
const Unit = require('../models/units');
const Ingredient = require('../models/ingredient');
const Conversion = require('../models/conversion');


async function convert(value, from, to, density = 1) {
    const fromUnit = await Unit.findOne({ name: from, isActive: true });
    const toUnit = await Unit.findOne({ name: to, isActive: true });

    if (!fromUnit || !toUnit) {
        throw new Error('Unit not found');
    }

    // mismo tipo (peso → peso, volumen → volumen)
    if (fromUnit.type === toUnit.type) {
        return (value * fromUnit.toBase) / toUnit.toBase;
    }

    // peso → volumen
    if (fromUnit.type === 'weight' && toUnit.type === 'volume') {
        const grams = value * fromUnit.toBase;
        const ml = grams / density;
        return ml / toUnit.toBase;
    }

    // volumen → peso
    if (fromUnit.type === 'volume' && toUnit.type === 'weight') {
        const ml = value * fromUnit.toBase;
        const grams = ml * density;
        return grams / toUnit.toBase;
    }

    throw new Error('Unsupported conversion');
}

router.get('/conversions', async (req, res) => {
    const conversions = await Conversion.find()
        .sort({ createdAt: -1 });

    res.json(conversions);
});

router.post('/conversion', async (req, res) => {
    try {
        const { value, fromUnit, toUnit, density, ingredientId } = req.body;

        if (value == null || value < 0) {
            return res.status(400).json({ message: 'Invalid value' });
        }

        let densityUsed = density ?? 1;
        let ingredientName = null;

        if (ingredientId) {
            const ingredient = await Ingredient.findOne({
                productId: ingredientId
            });

            if (!ingredient) {
                return res.status(400).json({ message: 'Ingredient not found' });
            }

            densityUsed = ingredient.density ?? 1;
            ingredientName = ingredient.name;
        }

        const result = await convert(value, fromUnit, toUnit, densityUsed);

        await Conversion.create({
            value,
            fromUnit,
            toUnit,
            result,
            densityUsed,
            ingredientId,
            ingredientName
        });

        res.json({
            from: `${value} ${fromUnit}`,
            to: `${result.toFixed(2)} ${toUnit}`,
            densityUsed
        });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


router.post('/conversion/kitchen', async (req, res) => {
    try {
        const { value, fromUnit, ingredientId, density } = req.body;

        const unit = await Unit.findOne({ name: fromUnit, isActive: true });
        if (!unit) {
            return res.status(400).json({ message: 'Invalid unit' });
        }

        let densityUsed = density || 1;

        if (ingredientId) {
            const ingredient = await Ingredient.findOne({
                productId: ingredientId
            });

            if (!ingredient) {
                return res.status(400).json({ message: 'Ingredient not found' });
            }

            densityUsed = ingredient.density;
        }

        let ml = unit.type === 'volume'
            ? value * unit.toBase
            : (value * unit.toBase) / densityUsed;

        res.json({
            from: `${value} ${fromUnit}`,
            to: formatKitchenUnits(ml),
            densityUsed
        });

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

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

module.exports = router;
