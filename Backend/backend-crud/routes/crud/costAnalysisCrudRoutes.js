const express = require('express');
const router = express.Router();
const CostAnalysis = require('../../models/costAnalysis');
const Recipe = require('../../models/recipe');
const Ingredient = require('../../models/ingredient');
const axios = require('axios');
const BUSINESS_API = process.env.BUSINESS_API_URL || 'http://localhost:3009/dishdash';

router.get('/costanalysis/recipe/:id/ingredients-options', async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        if (!recipe) {
            return res.status(404).json({ message: 'Recipe not found' });
        }
        
        const items = await Promise.all(
            recipe.ingredients.map(async (ingredient) => {
                const options = await Ingredient.find({ 
                    product: ingredient.ingredientName 
                });
                return { ingredient, options };
            })
        );
        
        res.json({ 
            recipeId: recipe._id, 
            name: recipe.name, 
            servings: recipe.servings, 
            items 
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching ingredients options', 
            error: error.message 
        });
    }
});

router.post('/costanalysis', async (req, res) => {
    try {
        const document = new CostAnalysis(req.body);
        await document.save();
        
        res.status(201).json(document);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating cost analysis', 
            error: error.message 
        });
    }
});

router.get('/costanalysis', async (req, res) => {
    try {
        const documents = await CostAnalysis.find()
            .sort({ createdAt: -1 }); 
        
        res.json(documents);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching cost analyses', 
            error: error.message 
        });
    }
});

router.get('/costanalysis/:id', async (req, res) => {
    try {
        const document = await CostAnalysis.findById(req.params.id);
        
        if (!document) {
            return res.status(404).json({ message: 'Cost analysis not found' });
        }
        
        res.json(document);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching cost analysis', 
            error: error.message 
        });
    }
});

router.put('/costanalysis/:id', async (req, res) => {
    try {
        const document = await CostAnalysis.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );

        if (!document) {
            return res.status(404).json({ message: 'Cost analysis not found' });
        }
        
        res.json(document);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating cost analysis', 
            error: error.message 
        });
    }
});

router.delete('/costanalysis/:id', async (req, res) => {
    try {
        const document = await CostAnalysis.findByIdAndDelete(req.params.id);
        
        if (!document) {
            return res.status(404).json({ message: 'Cost analysis not found' });
        }
        
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ 
            message: 'Error deleting cost analysis', 
            error: error.message 
        });
    }
});

router.post('/costanalysis/calculate/complete', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const url = `${BUSINESS_API}/costanalysis/calculate/complete`;
        const response = await axios.post(url, req.body, { headers: { Authorization: authHeader } });
        res.json(response.data);
    } catch (error) {
        console.error('Proxy calculate/complete failed:', error.response ? error.response.data : error.message);
        const status = error.response ? error.response.status : 500;
        res.status(status).json(error.response ? error.response.data : { message: error.message });
    }
});

router.post('/costanalysis/calculate/ingredients-cost', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const url = `${BUSINESS_API}/costanalysis/calculate/ingredients-cost`;
        const response = await axios.post(url, req.body, { headers: { Authorization: authHeader } });
        res.json(response.data);
    } catch (error) {
        console.error('Proxy calculate/ingredients-cost failed:', error.response ? error.response.data : error.message);
        const status = error.response ? error.response.status : 500;
        res.status(status).json(error.response ? error.response.data : { message: error.message });
    }
});

router.post('/costanalysis/calculate/product-cost', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const url = `${BUSINESS_API}/costanalysis/calculate/product-cost`;
        const response = await axios.post(url, req.body, { headers: { Authorization: authHeader } });
        res.json(response.data);
    } catch (error) {
        console.error('Proxy calculate/product-cost failed:', error.response ? error.response.data : error.message);
        const status = error.response ? error.response.status : 500;
        res.status(status).json(error.response ? error.response.data : { message: error.message });
    }
});

router.post('/costanalysis/calculate/taxes', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const url = `${BUSINESS_API}/costanalysis/calculate/taxes`;
        const response = await axios.post(url, req.body, { headers: { Authorization: authHeader } });
        res.json(response.data);
    } catch (error) {
        console.error('Proxy calculate/taxes failed:', error.response ? error.response.data : error.message);
        const status = error.response ? error.response.status : 500;
        res.status(status).json(error.response ? error.response.data : { message: error.message });
    }
});

module.exports = router;