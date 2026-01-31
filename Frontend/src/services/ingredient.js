import { axiosInstance } from './api';

const ingredientService = {
  getAll: async () => {
    return await axiosInstance.get('/ingredients');
  },
  getByCategory: async (category) => {
    return await axiosInstance.get(`/ingredients/category/${encodeURIComponent(category)}`);
  },
  getByProductId: async (productId) => {
    return await axiosInstance.get(`/ingredients/${encodeURIComponent(productId)}`);
  },
  getByName: async (name) => {
    return await axiosInstance.get(`/ingredients/name/${encodeURIComponent(name)}`);
  },
  create: async (ingredientData) => {
    return await axiosInstance.post('/ingredient', ingredientData);
  },
  update: async (productId, ingredientData) => {
    return await axiosInstance.put(`/ingredient/${encodeURIComponent(productId)}`, ingredientData);
  },
  delete: async (productId) => {
    return await axiosInstance.delete(`/ingredient/${encodeURIComponent(productId)}`);
  },
  restore: async (productId) => {
    return await axiosInstance.patch(`/ingredient/${encodeURIComponent(productId)}/restore`);
  }
};

export default ingredientService;