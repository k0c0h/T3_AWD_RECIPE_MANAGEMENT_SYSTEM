import { axiosInstance, axiosBusinessInstance } from "./api";

const recipeScalingService = {
  scaleRecipe: async (recipeId, data) => {
    return await axiosBusinessInstance.post(
      `/recipe/${encodeURIComponent(recipeId)}/scale`,
      data
    );
  },

  getAll: async () => {
    return await axiosInstance.get("/scaled-recipes");
  },

  getScaledRecipesByRecipe: async (recipeId) => {
    return await axiosInstance.get(
      `/scaled-recipes/recipe/${encodeURIComponent(recipeId)}`
    );
  },

  getById: async (id) => {
    return await axiosInstance.get(
      `/scaled-recipes/${encodeURIComponent(id)}`
    );
  },

  delete: async (id) => {
    return await axiosInstance.delete(
      `/scaled-recipes/${encodeURIComponent(id)}`
    );
  },
};

export default recipeScalingService;
