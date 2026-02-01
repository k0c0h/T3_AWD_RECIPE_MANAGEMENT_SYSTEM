import { axiosInstance, axiosBusinessInstance } from "./api";

const calendarService = {
  // Obtener todos los eventos
  getAll: async () => {
    return await axiosInstance.get("/calendar/events");
  },

  // Obtener evento por ID
  getById: async (id) => {
    return await axiosInstance.get(`/calendar/events/${encodeURIComponent(id)}`);
  },

  // Obtener eventos de una cotización
  getByQuotation: async (quotationId) => {
    return await axiosInstance.get(`/calendar/events/quotation/${encodeURIComponent(quotationId)}`);
  },

  // Crear evento
  create: async (data) => {
    return await axiosInstance.post("/calendar/events", data);
  },

  // Actualizar evento
  update: async (id, data) => {
    return await axiosInstance.put(`/calendar/events/${encodeURIComponent(id)}`, data);
  },

  // Eliminar evento
  delete: async (id) => {
    return await axiosInstance.delete(`/calendar/events/${encodeURIComponent(id)}`);
  },

  // Crear evento desde cotización (lógica de negocio)
  createFromQuotation: async (quotationId, meetingDate) => {
    return await axiosBusinessInstance.post(`/calendar/events/create-from-quotation/${encodeURIComponent(quotationId)}`, {
      meetingDate,
    });
  },

  // Sincronizar evento con Google Calendar
  syncWithGoogle: async (id) => {
    return await axiosBusinessInstance.post(`/calendar/events/${encodeURIComponent(id)}/sync-google`);
  },

  // Eliminar evento de Google Calendar
  deleteFromGoogle: async (id) => {
    return await axiosBusinessInstance.delete(`/calendar/events/${encodeURIComponent(id)}/google`);
  },
};

export default calendarService;
