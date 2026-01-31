import React from "react";

const API_BASE =
  import.meta.env.VITE_API_URL?.replace("/dishdash", "") ||
  "https://recipemanagement-caj9.onrender.com";

const getImageUrl = (path) => (path ? `${API_BASE}${path}` : "");

const RecipeDetailModal = ({ recipe, onClose }) => {
  if (!recipe) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="relative p-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-xl"
            aria-label="Cerrar"
          >
            ✕
          </button>

          <div className="flex gap-5 items-start">
            {/* Info */}
            <div className="flex-1 space-y-2">
              <h2 className="text-2xl font-semibold text-gray-800">
                {recipe.name}
              </h2>

              <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-[#9FB9B3]/20 text-[#5a7f78]">
                {recipe.category}
              </span>

              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600 mt-3">
                <p>
                  <strong>Porciones:</strong> {recipe.servings}
                </p>
                <p>
                  <strong>Precio:</strong> ${recipe.pricePerServing}
                </p>
                <p>
                  <strong>Costo:</strong> ${recipe.costPerServing}
                </p>
              </div>
            </div>

            {/* Image */}
            {recipe.imageUrl ? (
              <div className="w-28 h-28 rounded-lg overflow-hidden border bg-gray-100 shrink-0">
                <img
                  src={getImageUrl(recipe.imageUrl)}
                  alt={recipe.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-28 h-28 flex items-center justify-center text-xs text-gray-400 border rounded-lg bg-gray-50 shrink-0">
                Sin imagen
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 space-y-5 text-sm">

          {/* Description */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-1">Descripción</h4>
            <p className="text-gray-700">
              {recipe.description || "Sin descripción"}
            </p>
          </div>

          {/* Ingredients */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Ingredientes</h4>
            {recipe.ingredients?.length > 0 ? (
              <ul className="space-y-2">
                {recipe.ingredients.map((ing, i) => (
                  <li
                    key={ing._id || ing.productId || i}
                    className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md"
                  >
                    <span className="text-gray-800">
                      {ing.ingredientName || ing.name}
                    </span>
                    <span className="text-gray-600">
                      {ing.quantity} {ing.unit}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">Sin ingredientes</p>
            )}
          </div>

          {/* Instructions */}
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Instrucciones</h4>
            {Array.isArray(recipe.instructions) &&
            recipe.instructions.length > 0 ? (
              <ol className="space-y-2 list-decimal list-inside text-gray-700">
                {recipe.instructions.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            ) : (
              <p className="text-gray-500">Sin instrucciones</p>
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-md text-white font-medium bg-[#9FB9B3] hover:opacity-90"
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
