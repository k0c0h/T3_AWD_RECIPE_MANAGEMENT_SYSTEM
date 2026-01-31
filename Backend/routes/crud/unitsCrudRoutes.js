const express = require('express');
const router = express.Router();
const Unit = require('../../models/units');

router.get('/units', async (req, res) => {
    try {
        const units = await Unit.find({ isActive: true });
        res.json(units);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/units/all', async (req, res) => {
    try {
        const units = await Unit.find();
        res.json(units);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
