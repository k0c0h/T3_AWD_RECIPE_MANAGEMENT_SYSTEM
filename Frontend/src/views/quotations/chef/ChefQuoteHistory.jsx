import { useEffect, useMemo, useState } from "react";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import Toast from "../../../components/ui/Toast";
import quotationService from "../../../services/quotation";
import ChefQuoteDetailsModal from "./ChefQuoteDetailsModal";
import { useAuth } from "../../../context/AuthContext";
import Quotation from "../../../models/Quotation";

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente" },
  { value: "approved", label: "Aprobada" },
  { value: "completed", label: "Completada" },
  { value: "cancelled", label: "Cancelada" },
];

const STATUS_STYLES = {
  pending: { bg: "#f5e8d8", text: "#8b5a2b" },
  approved: { bg: "#dceee7", text: "#2f6f5c" },
  completed: { bg: "#e6e6e6", text: "#4b5563" },
  cancelled: { bg: "#f3d6d6", text: "#9b2c2c" },
};

const getStatusStyle = (status) => STATUS_STYLES[status] || { bg: "#e5e7eb", text: "#374151" };

const formatCurrency = (value, currency = "$") => {
  const numberValue = Number(value || 0);
  return `${currency}${numberValue.toFixed(2)}`;
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const ChefQuoteHistory = ({ onBack, refreshKey = 0 }) => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, action: null, payload: null, loading: false });
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ id: Date.now(), message, type });
  };

  const loadQuotes = async () => {
    setIsLoading(true);
    try {
      const data = await quotationService.getAll({ quotationType: "chef_quotation" });
      const modeled = Quotation.fromJSONArray(Array.isArray(data) ? data : []);
      const chefId = user?._id || user?.id;
      const filteredByChef = chefId
        ? modeled.filter((q) => q.chefId === chefId)
        : modeled;
      setQuotes(filteredByChef);
    } catch (error) {
      console.error("Error loading quotes:", error);
      showToast("No se pudo cargar el historial", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadQuotes();
  }, [refreshKey]);

  const filteredQuotes = useMemo(() => {
    let result = quotes;
    if (statusFilter !== "all") {
      result = result.filter((q) => q.status === statusFilter);
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (q) =>
          q.clientInfo?.name?.toLowerCase().includes(term) ||
          q.eventInfo?.eventType?.toLowerCase().includes(term)
      );
    }
    return result;
  }, [quotes, statusFilter, searchTerm]);

  const handleOpenDetails = (quote) => {
    setSelectedQuote(quote);
    setDetailsOpen(true);
  };

  const handleStatusChange = async (quoteId, status) => {
    try {
      await quotationService.updateStatus(quoteId, status);
      setQuotes((prev) => prev.map((q) => (q._id === quoteId ? new Quotation({ ...q, status }) : q)));
      showToast("Estado actualizado", "success");
    } catch (error) {
      console.error("Error updating status:", error);
      showToast(error?.message || "Error al actualizar estado", "error");
    }
  };

  const requestDelete = (quote) => {
    setConfirm({ open: true, action: "delete", payload: quote, loading: false });
  };

  const requestApprove = (quote) => {
    setConfirm({ open: true, action: "approve", payload: quote, loading: false });
  };

const runConfirmedAction = async () => {
  const { action, payload } = confirm;
  setConfirm((prev) => ({ ...prev, loading: true }));
  try {
    if (action === "delete") {
      await quotationService.remove(payload._id);
      setQuotes((prev) => prev.filter((q) => q._id !== payload._id));
      showToast("Cotización eliminada", "success");
    }
    if (action === "approve") {
      await quotationService.updateStatus(payload._id, "approved");
      setQuotes((prev) => prev.map((q) => (q._id === payload._id ? new Quotation({ ...q, status: "approved" }) : q)));
      showToast("Cotización aprobada y agendada", "success");
    }
  } catch (error) {
    console.error("Error on action:", error);
    showToast(error?.message || "Error en la operación", "error");
  } finally {
    setConfirm({ open: false, action: null, payload: null, loading: false });
  }
};

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "#9FB9B3" }}></div>
          <p className="text-gray-600">Cargando historial...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
              Historial de cotizaciones
            </h1>
            <p className="text-gray-600">
              Consulta y gestiona tus cotizaciones guardadas.
            </p>
          </div>
          <button 
            onClick={onBack} 
            className="bg-[#9FB9B3] hover:bg-[#8aa59f] text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Volver al formulario
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg border shadow-sm mb-4" style={{ borderColor: "#e5dfd8" }}>
          <div className="flex flex-col md:flex-row md:items-center gap-3">
            <input
              className="border rounded-md px-3 py-2 flex-1 focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent outline-none"
              placeholder="Buscar por cliente o tipo de evento"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              className="border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos los estados</option>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredQuotes.length === 0 ? (
          <div className="bg-white rounded-lg border p-10 text-center text-gray-600 shadow-sm" style={{ borderColor: "#e5dfd8" }}>
            Aún no hay cotizaciones guardadas.
          </div>
        ) : (
          <div>
            <div className="md:hidden space-y-4">
              {filteredQuotes.map((quote) => {
                const statusStyle = getStatusStyle(quote.status);
                return (
                  <div key={quote._id} className="bg-white rounded-lg border shadow-sm p-4" style={{ borderColor: "#e5dfd8" }}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-gray-800">
                          {quote.clientInfo?.name || "Cliente"}
                        </h3>
                        <p className="text-xs text-gray-500">{quote.clientInfo?.email}</p>
                      </div>
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                      >
                        {STATUS_OPTIONS.find((s) => s.value === quote.status)?.label || quote.status}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-600">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Evento</span>
                        <span className="font-medium text-gray-800">{quote.eventInfo?.eventType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Invitados</span>
                        <span className="font-medium text-gray-800">{quote.eventInfo?.numberOfGuests}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Fecha</span>
                        <span className="font-medium text-gray-800">{formatDate(quote.eventInfo?.eventDate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Total</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(quote.totalAmount)}</span>
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-xs font-medium text-gray-600 mb-1">Estado</label>
                      <select
                        className="w-full border rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent outline-none"
                        value={quote.status}
                        onChange={(e) => handleStatusChange(quote._id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenDetails(quote)}
                        className="px-3 py-1.5 text-xs font-medium text-white rounded hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: "#9FB9B3" }}
                      >
                        Ver cotización
                      </button>
                      {quote.status !== "approved" && (
                        <button
                          type="button"
                          onClick={() => requestApprove(quote)}
                          className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                        >
                          Aprobar y agendar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => requestDelete(quote)}
                        className="px-3 py-1.5 text-xs font-medium text-white rounded hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: "#d97a7a" }}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="hidden md:block bg-white rounded-lg border shadow-sm overflow-hidden" style={{ borderColor: "#e5dfd8" }}>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead style={{ backgroundColor: "#f5f2eb" }} className="text-gray-700">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider">Cliente</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider">Evento</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider">Fecha</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider">Estado</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider">Total</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredQuotes.map((quote) => {
                      const statusStyle = getStatusStyle(quote.status);
                      return (
                        <tr key={quote._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium text-gray-800">
                              {quote.clientInfo?.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {quote.clientInfo?.email}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-gray-700">{quote.eventInfo?.eventType}</div>
                            <div className="text-xs text-gray-500">
                              {quote.eventInfo?.numberOfGuests} invitados
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            {formatDate(quote.eventInfo?.eventDate)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span
                                className="px-2.5 py-1 rounded-full text-xs font-medium"
                                style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
                              >
                                {STATUS_OPTIONS.find((s) => s.value === quote.status)?.label || quote.status}
                              </span>
                              <select
                                className="border rounded-md px-2 py-1 text-xs focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent outline-none"
                                value={quote.status}
                                onChange={(e) => handleStatusChange(quote._id, e.target.value)}
                              >
                                {STATUS_OPTIONS.map((option) => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-gray-800">
                            {formatCurrency(quote.totalAmount)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenDetails(quote)}
                                className="px-3 py-1.5 text-xs font-medium text-white rounded hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: "#9FB9B3" }}
                              >
                                Ver cotización
                              </button>
                              {quote.status !== "approved" && (
                                <button
                                  type="button"
                                  onClick={() => requestApprove(quote)}
                                  className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                                >
                                  Aprobar y agendar
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => requestDelete(quote)}
                                className="px-3 py-1.5 text-xs font-medium text-white rounded hover:opacity-90 transition-opacity"
                                style={{ backgroundColor: "#d97a7a" }}
                              >
                                Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      <ChefQuoteDetailsModal
        quotation={selectedQuote}
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
      />

      <ConfirmationModal
        isOpen={confirm.open}
        title={confirm.action === "delete" ? "Eliminar cotización" : "Aprobar cotización"}
        message={
          confirm.action === "delete"
            ? "¿Deseas eliminar esta cotización?"
            : "Se creará un evento de calendario automáticamente. ¿Continuar?"
        }
        confirmText={confirm.action === "delete" ? "Eliminar" : "Aprobar"}
        cancelText="Cancelar"
        onConfirm={runConfirmedAction}
        onCancel={() => setConfirm({ open: false, action: null, payload: null, loading: false })}
        loading={confirm.loading}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default ChefQuoteHistory;
