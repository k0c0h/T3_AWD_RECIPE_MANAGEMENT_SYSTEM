import React from "react";
import { Modal } from "../../../components/ui/Modal";

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

const ChefQuoteDetailsModal = ({ quotation, isOpen, onClose }) => {
  if (!quotation) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-800">
            Detalle de cotización
          </h2>
          <p className="text-sm text-gray-500">
            {quotation.clientInfo?.name || "Cliente"} · {quotation.status}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Cliente</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Nombre: {quotation.clientInfo?.name}</div>
              <div>Teléfono: {quotation.clientInfo?.phone}</div>
              <div>Email: {quotation.clientInfo?.email}</div>
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-700 mb-2">Evento</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <div>Tipo: {quotation.eventInfo?.eventType}</div>
              <div>Invitados: {quotation.eventInfo?.numberOfGuests}</div>
              <div>
                Fecha: {formatDate(quotation.eventInfo?.eventDate)} · {quotation.eventInfo?.eventTime}
              </div>
              <div>
                Lugar: {quotation.eventInfo?.location?.venueName || ""}
              </div>
              <div>Dirección: {quotation.eventInfo?.location?.address}</div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-4">Recetas</h3>
          <div className="space-y-3">
            {quotation.recipes?.map((recipe) => (
              <div key={recipe.recipeId} className="border rounded-lg p-3">
                <div className="flex justify-between font-medium text-gray-800">
                  <span>{recipe.recipeName}</span>
                  <span>{formatCurrency(recipe.totalCost)}</span>
                </div>
                <div className="text-xs text-gray-500 mb-2">
                  {recipe.servings} porciones · {formatCurrency(recipe.costPerServing)} / porción
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-gray-500">
                  {recipe.lines?.map((line, idx) => (
                    <div key={`${recipe.recipeId}-${idx}`}>
                      {line.name} · {line.quantity} {line.unit}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-700 mb-3">Totales</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(quotation.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Descuento</span>
              <span>{formatCurrency(quotation.discountAmount)}</span>
            </div>
            <div className="flex justify-between">
              <span>Impuestos</span>
              <span>{formatCurrency(quotation.taxes?.totalTaxes)}</span>
            </div>
            <div className="flex justify-between font-semibold text-gray-800">
              <span>Total</span>
              <span>{formatCurrency(quotation.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ChefQuoteDetailsModal;
