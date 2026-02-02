import { axiosInstance, axiosBusinessInstance } from "./api";
import axiosPublic from './apiPublic';
import axios from 'axios';


const recipeService = {
  getAllRecipes: async () => {
    return await axiosPublic.get('/public/recipes');
  },

  getAll: async () => {
    return await axiosInstance.get('/recipes');
  },

  getById: async (id) => {
    return await axiosInstance.get(`/recipes/${encodeURIComponent(id)}`);
  },

  create: async (data) => {
    return await axiosInstance.post('/recipes', data);
  },

  createWithCosts: async (data) => {
    const recipe = await axiosInstance.post('/recipes', data);
    const recipeId = recipe._id;

    return await axiosBusinessInstance.post(
      `/recipe/${encodeURIComponent(recipeId)}/calculate-costs`
    );
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

  getByCategory: async (category) => {
    return await axiosBusinessInstance.get(
      `/recipes/category/${encodeURIComponent(category)}`
    );
  },

  getByName: async (name) => {
    return await axiosBusinessInstance.get(
      `/recipes/name/${encodeURIComponent(name)}`
    );
  },

  calculateCosts: async (id) => {
    return await axiosBusinessInstance.post(
      `/recipe/${encodeURIComponent(id)}/calculate-costs`
    );
  },

  recalculateCosts: async (id) => {
    return await axiosBusinessInstance.put(
      `/recipe/${encodeURIComponent(id)}/recalculate-costs`
    );
  },

  scale: async (id, data) => {
    return await axiosBusinessInstance.post(
      `/recipes/${encodeURIComponent(id)}/scale`,
      data
    );
  },
};

export default recipeService;
