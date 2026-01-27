const express = require('express');
const router = express.Router();
const Unit = require('../../models/units');

router.get('/units', async (req, res) => {
    try {
        const units = await Unit.find({ isActive: true });

        res.json({
            weight: units
                .filter(u => u.type === 'weight')
                .map(u => u.name),

            volume: units
                .filter(u => u.type === 'volume')
                .map(u => u.name),

            special: ['kitchen']
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/unitsall', async (req, res) => {
    try {
        const units = await Unit.find();
        res.json(units);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
