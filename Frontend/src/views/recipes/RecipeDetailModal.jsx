import React from "react";
import { formatCurrency, formatNumber } from '../../utils/format';

const API_BASE =
  import.meta.env.VITE_API_CRUD?.replace("/dishdash", "") ||
  "http://recipemanagementcrud.onrender.com/dishdash";

const getImageUrl = (path) => (path ? `${API_BASE}${path}` : "");

const RecipeDetailModal = ({ recipe, onClose }) => {
  if (!recipe) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div
        className="w-full max-w-3xl rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: "#f5f2eb" }}
      >
        {/* HEADER */}
        <div className="relative p-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl"
          >
            ✕
          </button>

          <div className="flex gap-6 items-start">
            {/* INFO */}
            <div className="flex-1 space-y-3">
              <span
                className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                style={{ backgroundColor: "#adc4bc", color: "#355f5b" }}
              >
                {recipe.category}
              </span>

              <h2 className="text-2xl font-bold text-gray-800">
                {recipe.name}
              </h2>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  🍽 <strong>{recipe.servings}</strong> porciones
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  💲 Precio: <strong>{formatCurrency(recipe.pricePerServing)}</strong>
                </div>
                <div className="bg-white rounded-lg p-3 shadow-sm">
                  💰 Costo: <strong>{formatCurrency(recipe.costPerServing)}</strong>
                </div>
              </div>
            </div>

            {/* IMAGE */}
            {recipe.imageUrl ? (
              <div className="w-40 h-40 rounded-xl overflow-hidden border bg-white shadow-sm shrink-0">
                <img
                  src={getImageUrl(recipe.imageUrl)}
                  alt={recipe.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-40 h-40 flex items-center justify-center text-xs text-gray-400 border rounded-xl bg-white shrink-0">
                Sin imagen
              </div>
            )}
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-6 pb-6 space-y-6 text-sm">
          {/* Descripción */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-1">
              Descripción
            </h4>
            <p className="text-gray-700">
              {recipe.description || "Sin descripción"}
            </p>
          </div>

          {/* Ingredientes */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-3">
              Ingredientes
            </h4>

            {recipe.ingredients?.length > 0 ? (
              <ul className="space-y-2">
                {recipe.ingredients.map((ing, i) => (
                  <li
                    key={ing._id || i}
                    className="flex justify-between items-center px-3 py-2 rounded-lg"
                    style={{ backgroundColor: "#f5f2eb" }}
                  >
                    <span className="text-gray-800">
                      {ing.ingredientName || ing.name}
                    </span>
                    <span className="text-gray-600">
                      {typeof ing.quantity === 'number' ? formatNumber(ing.quantity) : ing.quantity} {ing.unit}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Sin ingredientes</p>
            )}
          </div>

          {/* Instrucciones */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h4 className="font-semibold text-gray-800 mb-3">
              Instrucciones
            </h4>

            {Array.isArray(recipe.instructions) &&
            recipe.instructions.length > 0 ? (
              <ol className="list-decimal list-inside space-y-2 text-gray-700">
                {recipe.instructions.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            ) : (
              <p className="text-gray-500">Sin instrucciones</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: "#adc4bc" }}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailModal;
