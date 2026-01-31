import { axiosInstance } from "./api";

const recipeService = {
  getAll: async () => {
    return await axiosInstance.get("/recipes");
  },
  getByCategory: async (category) => {
    return await axiosInstance.get(
      `/recipes/category/${encodeURIComponent(category)}`
    );
  },
  getByName: async (name) => {
    return await axiosInstance.get(
      `/recipes/name/${encodeURIComponent(name)}`
    );
  },
  getById: async (id) => {
    return await axiosInstance.get(`/recipes/${encodeURIComponent(id)}`);
  },
  create: async (data) => {
    return await axiosInstance.post("/recipe", data, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  update: async (id, data) => {
    return await axiosInstance.put(
      `/recipe/${encodeURIComponent(id)}`,
      data
    );
  },

  remove: async (id) => {
    return await axiosInstance.delete(
      `/recipe/${encodeURIComponent(id)}`
    );
  },
  forceDelete: async (id) => {
    return await axiosInstance.delete(
      `/recipe/${encodeURIComponent(id)}/force`
    );
  },

  restore: async (id) => {
    return await axiosInstance.patch(
      `/recipe/${encodeURIComponent(id)}/restore`
    );
  },
};

export default recipeService;
