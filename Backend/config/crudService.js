const axios = require('axios');

const CRUD_API =
    process.env.CRUD_API_URL ||
    'https://recipemanagement-caj9.onrender.com/dishdash';

module.exports = {

    getUnitByName: async (name) => {
        const res = await axios.get(`${CRUD_API}/units`);
        return res.data.find(u => u.name === name);
    },

    getIngredientByProductId: async (productId) => {
        const res = await axios.get(`${CRUD_API}/ingredients/product/${productId}`);
        return res.data;
    },

    saveConversion: async (conversion) => {
        await axios.post(`${CRUD_API}/conversions`, conversion);
    }
};
