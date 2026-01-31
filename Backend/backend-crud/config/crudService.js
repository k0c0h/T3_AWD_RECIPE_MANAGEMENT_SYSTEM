const axios = require('axios');

// Este backend-crud ES el servidor CRUD, por lo que apunta a sí mismo
const CRUD_API =
    process.env.CRUD_API_URL ||
    'https://recipemanagementcrud.onrender.com/dishdash';

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
