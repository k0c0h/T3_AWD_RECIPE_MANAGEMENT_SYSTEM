import { axiosInstance } from "./api";

const costAnalysisService = {
  calculateIngredientsCost: async (selectedIngredients) => {
    return await axiosInstance.post(
      "/costanalysis/calculate/ingredients-cost",
      { selectedIngredients }
    );
  },

  calculateProductCost: async (data) => {
    return await axiosInstance.post(
      "/costanalysis/calculate/product-cost",
      data
    );
  },

  calculateTaxes: async (data) => {
    console.log("SERVICE TAXES PAYLOAD", data);

    return await axiosInstance.post(
      "/costanalysis/calculate/taxes",
      data
    );
  },




  getIngredientsOptions: async (recipeId) => {
    return await axiosInstance.get(
      `/costanalysis/recipe/${encodeURIComponent(recipeId)}/ingredients-options`
    );
  },

  create: async (data) => {
    return await axiosInstance.post("/costanalysis", data);
  },

  getAll: async () => {
    return await axiosInstance.get("/costanalysis");
  },

  getById: async (id) => {
    return await axiosInstance.get(
      `/costanalysis/${encodeURIComponent(id)}`
    );
  },

  update: async (id, data) => {
    return await axiosInstance.put(
      `/costanalysis/${encodeURIComponent(id)}`,
      data
    );
  },

  remove: async (id) => {
    return await axiosInstance.delete(
      `/costanalysis/${encodeURIComponent(id)}`
    );
  },
};

export default costAnalysisService;