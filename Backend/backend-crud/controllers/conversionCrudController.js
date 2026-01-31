const Conversion = require('../models/conversion');

module.exports = {

    getAll: async (req, res) => {
        try {
            const conversions = await Conversion
                .find()
                .sort({ createdAt: -1 });

            res.json(conversions);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

    create: async (req, res) => {
        try {
            const {
                value,
                fromUnit,
                toUnit,
                result,
                densityUsed,
                ingredientId,
                ingredientName
            } = req.body;

            const conversion = await Conversion.create({
                value,
                fromUnit,
                toUnit,
                result,
                densityUsed,
                ingredientId,
                ingredientName
            });

            res.status(201).json(conversion);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },

    update: async (req, res) => {
        try {
            const updated = await Conversion.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );

            if (!updated) {
                return res.status(404).json({ message: 'Not found' });
            }

            res.json(updated);
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    },

    remove: async (req, res) => {
        try {
            const deleted = await Conversion.findByIdAndDelete(req.params.id);

            if (!deleted) {
                return res.status(404).json({ message: 'Not found' });
            }

            res.json({ message: 'Deleted successfully' });
        } catch (err) {
            res.status(400).json({ message: err.message });
        }
    }
};
