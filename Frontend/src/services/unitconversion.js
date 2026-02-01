import { axiosInstance,axiosBusinessInstance } from './api';

const unitConversionService = {

  convert: async (data) => {
    return await axiosBusinessInstance.post('/conversion', data);
  },

  convertAndSave: async (data) => {
    return await axiosBusinessInstance.post('/conversion', data);
  },

  getAll: async () => {
    return await axiosBusinessInstance.get('/conversions');
  },

  getAllUnits: async () => {
    return await axiosInstance.get('/units/all');
  },

  delete: async (id) => {
    return await axiosBusinessInstance.delete(`/conversion/${id}`);
  }
};

export default unitConversionService;