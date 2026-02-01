import { axiosInstance, axiosBusinessInstance } from "./api";

const quotationService = {
  // Obtener todas las cotizaciones
  getAll: async () => {
    return await axiosInstance.get("/quotations");
  },

  // Obtener cotizaciones para calendario (aprobadas/completadas)
  getForCalendar: async () => {
    return await axiosInstance.get("/quotations/calendar");
  },

  // Obtener por ID
  getById: async (id) => {
    return await axiosInstance.get(`/quotations/${encodeURIComponent(id)}`);
  },

  // Crear solicitud de cliente
  createClientRequest: async (data) => {
    return await axiosInstance.post("/quotations/client-request", data);
  },

  // Crear cotización de chef
  createChefQuotation: async (data) => {
    return await axiosInstance.post("/quotations/chef-quotation", data);
  },

  // Actualizar cotización
  update: async (id, data) => {
    return await axiosInstance.put(`/quotations/${encodeURIComponent(id)}`, data);
  },

  // Actualizar solo estado
  updateStatus: async (id, status) => {
    return await axiosInstance.patch(`/quotations/${encodeURIComponent(id)}/status`, { status });
  },

  // Aprobar y programar evento (lógica de negocio)
  approveAndSchedule: async (id) => {
    return await axiosBusinessInstance.patch(`/quotations/${encodeURIComponent(id)}/approve-and-schedule`);
  },

  // Eliminar
  delete: async (id) => {
    return await axiosInstance.delete(`/quotations/${encodeURIComponent(id)}`);
  },

  // Calcular estimado de cliente
  estimateClientCost: async (data) => {
    return await axiosBusinessInstance.post("/quotations/client-request/estimate", data);
  },

  // Calcular cotización de chef
  calculateChefQuotation: async (data) => {
    return await axiosBusinessInstance.post("/quotations/chef-calculate", data);
  },
};

export default quotationService;
