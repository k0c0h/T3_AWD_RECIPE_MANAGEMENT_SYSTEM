import { axiosInstance, axiosBusinessInstance } from "./api";
import axiosPublic from "./apiPublic";

const quotationService = {
  getForCalendar: async () => {
    return await axiosInstance.get("/quotations/calendar");
  },

  getAll: async (params = {}) => {
    return await axiosInstance.get("/quotations", { params });
  },

  getById: async (id) => {
    return await axiosInstance.get(`/quotations/${encodeURIComponent(id)}`);
  },

  createChefQuotation: async (payload) => {
    return await axiosInstance.post("/quotations/chef-quotation", payload);
  },

  create: async (payload) => {
    return await axiosInstance.post("/quotations", payload);
  },

  update: async (id, data) => {
    return await axiosInstance.put(`/quotations/${encodeURIComponent(id)}`, data);
  },

  updateStatus: async (id, status) => {
    return await axiosInstance.patch(
      `/quotations/${encodeURIComponent(id)}/status`,
      { status }
    );
  },

  remove: async (id) => {
    return await axiosInstance.delete(`/quotations/${encodeURIComponent(id)}`);
  },

  approveAndSchedule: async (id) => {
    return await axiosBusinessInstance.patch(
      `/quotations/${encodeURIComponent(id)}/approve-and-schedule`
    );
  },

  createClientRequest: async (payload) => {
    return await axiosPublic.post("/public/quotations/client-request", payload);
  },

  estimateClientRequest: async (payload) => {
    return await axiosBusinessInstance.post(
      "/quotations/client-request/estimate",
      payload
    );
  },

  calculateChefQuotation: async (payload) => {
    return await axiosBusinessInstance.post(
      "/quotations/chef-calculate",
      payload
    );
  }
};

export default quotationService;