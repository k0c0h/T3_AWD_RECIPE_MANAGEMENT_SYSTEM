const Ingredient = require('../models/ingredient');
const Conversion = require('../models/conversion');
const { convert, formatKitchenUnits } = require('./conversionLogic');
const Unit = require('../models/units');

module.exports = {
    convertAndSave: async (req, res) => {
        try {
            const { value, fromUnit, toUnit, density, ingredientId } = req.body;

            if (value == null || value < 0) {
                return res.status(400).json({ message: 'Invalid value' });
            }

            let densityUsed = density ?? 1;
            let ingredientName = null;

            if (ingredientId) {
                const ingredient = await Ingredient.findOne({ productId: ingredientId });

                if (!ingredient) return res.status(404).json({ message: 'Ingredient not found' });

                densityUsed = ingredient.density ?? 1;
                ingredientName = ingredient.name;
            }

            const result = await convert(value, fromUnit, toUnit, densityUsed);

            // Automatically save conversion record
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
    },

    kitchenConversion: async (req, res) => {
        try {
            const { value, fromUnit, ingredientId, density } = req.body;
            const unit = await Unit.findOne({ name: fromUnit, isActive: true });

            if (!unit) return res.status(400).json({ message: 'Invalid unit' });

            let densityUsed = density || 1;

            if (ingredientId) {
                const ingredient = await Ingredient.findOne({ productId: ingredientId });

                if (!ingredient) return res.status(404).json({ message: 'Ingredient not found' });

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
    }
};
