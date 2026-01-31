const express = require('express');
const router = express.Router();
const axios = require('axios');

router.get('/unit-groups', async (req, res) => {
    try {
        const response = await axios.get('https://recipemanagement-caj9.onrender.com/dishdash/units');
        const units = response.data;

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

module.exports = router;
