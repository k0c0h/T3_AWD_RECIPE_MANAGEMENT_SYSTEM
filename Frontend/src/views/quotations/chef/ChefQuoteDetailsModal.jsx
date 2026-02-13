import React from "react";
import { Modal } from "../../../components/ui/Modal";
import { generateQuotationPDF } from "../../../services/pdfService";

const formatCurrency = (value, currency = "$", decimals = 2) => {
  const numberValue = Number(value || 0);
  return `${currency}${numberValue.toFixed(decimals)}`;
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

const STATUS_STYLES = {
  pending: { bg: "#f5e8d8", text: "#8b5a2b" },
  approved: { bg: "#dceee7", text: "#2f6f5c" },
  completed: { bg: "#e6e6e6", text: "#4b5563" },
  cancelled: { bg: "#f3d6d6", text: "#9b2c2c" },
};

const getStatusStyle = (status) => STATUS_STYLES[status] || { bg: "#e5e7eb", text: "#374151" };

const ChefQuoteDetailsModal = ({ quotation, isOpen, onClose }) => {
  if (!quotation) return null;

  const statusStyle = getStatusStyle(quotation.status);

  const handleExportPDF = () => {
    try {
      generateQuotationPDF(quotation);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert("Hubo un error al generar el PDF. Por favor intenta nuevamente.");
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="rounded-xl overflow-hidden border" style={{ borderColor: "#e5dfd8" }}>
        <div className="px-5 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3" style={{ backgroundColor: "#f5f2eb" }}>
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Detalle de cotización
            </h2>
            <p className="text-sm text-gray-600">
              {quotation.clientInfo?.name || "Cliente"}
            </p>
          </div>
          <span
            className="px-3 py-1 rounded-full text-xs font-semibold"
            style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}
          >
            {quotation.status}
          </span>
        </div>

        <div className="p-5 space-y-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border rounded-lg p-4" style={{ borderColor: "#e5dfd8" }}>
              <h3 className="font-semibold text-gray-700 mb-3">Cliente</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Nombre</span>
                  <span className="font-medium text-gray-800">{quotation.clientInfo?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Teléfono</span>
                  <span className="font-medium text-gray-800">{quotation.clientInfo?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Email</span>
                  <span className="font-medium text-gray-800">{quotation.clientInfo?.email}</span>
                </div>
              </div>
            </div>
            <div className="bg-white border rounded-lg p-4" style={{ borderColor: "#e5dfd8" }}>
              <h3 className="font-semibold text-gray-700 mb-3">Evento</h3>
              <div className="text-sm text-gray-600 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tipo</span>
                  <span className="font-medium text-gray-800">{quotation.eventInfo?.eventType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Invitados</span>
                  <span className="font-medium text-gray-800">{quotation.eventInfo?.numberOfGuests}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Fecha</span>
                  <span className="font-medium text-gray-800">
                    {formatDate(quotation.eventInfo?.eventDate)} · {quotation.eventInfo?.eventTime}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Lugar</span>
                  <span className="font-medium text-gray-800">{quotation.eventInfo?.location?.venueName || ""}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Dirección</span>
                  <span className="font-medium text-gray-800">{quotation.eventInfo?.location?.address}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4" style={{ borderColor: "#e5dfd8" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-700">Recetas</h3>
              <span className="text-xs text-gray-500">{quotation.recipes?.length || 0} recetas</span>
            </div>
            <div className="space-y-3">
              {quotation.recipes?.map((recipe) => (
                <div key={recipe.recipeId} className="border rounded-lg p-3" style={{ borderColor: "#e5dfd8" }}>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 font-medium text-gray-800">
                    <span>{recipe.recipeName}</span>
                    <span className="text-[#2f6f5c]">{formatCurrency(recipe.totalCost)}</span>
                  </div>
                  <div className="text-xs text-gray-500 mb-2">
                    {recipe.servings} porciones · {formatCurrency(recipe.costPerServing)} / porción
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    {recipe.lines?.map((line, idx) => (
                      <span
                        key={`${recipe.recipeId}-${idx}`}
                        className="px-2 py-1 rounded-full"
                        style={{ backgroundColor: "#f5f2eb" }}
                      >
                        {line.name} · {line.quantity} {line.unit}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border rounded-lg p-4" style={{ borderColor: "#e5dfd8" }}>
            <h3 className="font-semibold text-gray-700 mb-3">Totales</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium text-gray-800">{formatCurrency(quotation.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Descuento</span>
                <span className="font-medium text-gray-800">{formatCurrency(quotation.discountAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Impuestos</span>
                <span className="font-medium text-gray-800">{formatCurrency(quotation.taxes?.totalTaxes)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-gray-900 pt-2 border-t" style={{ borderColor: "#e5dfd8" }}>
                <span>Total</span>
                <span className="text-[#2f6f5c]">{formatCurrency(quotation.totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t" style={{ borderColor: "#e5dfd8" }}>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 text-sm font-medium text-white rounded-md hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#9FB9B3" }}
            >
              📄 Exportar PDF
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ChefQuoteDetailsModal;