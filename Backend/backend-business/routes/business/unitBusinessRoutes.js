const express = require('express');
const router = express.Router();
const axios = require('axios');
const crudService = require('../../config/crudService');

router.get('/unit-groups', async (req, res) => {
    try {
        const CRUD_API = process.env.CRUD_API_URL || 'https://recipemanagementcrud.onrender.com/dishdash';
        const response = await axios.get(`${CRUD_API}/units`);
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
