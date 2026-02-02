import React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

const API_BASE =
  import.meta.env.VITE_API_CRUD?.replace("/dishdash", "") ||
  "http://localhost:3007";

const getImageUrl = (path) =>
  path ? `${API_BASE}${path}` : "/placeholder.jpg";

const RecipesGrid = ({ recipes, onView, onEdit, onDelete }) => {
  if (!recipes.length) {
    return (
      <p className="text-center text-gray-500 mt-12">
        No hay recetas disponibles
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {recipes.map((recipe) => (
        <div
          key={recipe._id}
          className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition bg-[#f5f2eb]"
        >
          {/* Image */}
          <div className="h-40 bg-gray-200 overflow-hidden">
            <img
              src={getImageUrl(recipe.imageUrl || recipe.image)}
              alt={recipe.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="p-4 flex flex-col justify-between h-[230px]">
            <div>
              <span className="inline-block mb-1 px-3 py-1 text-xs rounded-full bg-[#e7c78a]/60 text-gray-800 font-medium">
                {recipe.category}
              </span>

              <h3 className="text-lg font-bold text-gray-800">
                {recipe.name}
              </h3>

              <p className="text-sm text-gray-600 mt-2 line-clamp-3">
                {recipe.description || "Sin descripción"}
              </p>

              <p className="text-xs text-gray-500 mt-2">
                🍽 {recipe.servings} porciones
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={() => onView(recipe)}
                className="p-2 rounded-lg bg-[#adc4bc] hover:bg-[#9fb9b3] text-white"
              >
                <Eye size={16} />
              </button>

              <button
                onClick={() => onEdit(recipe)}
                className="p-2 rounded-lg bg-[#c8d0d2] hover:bg-[#b6c0c2] text-gray-800"
              >
                <Pencil size={16} />
              </button>

              {onDelete && (
                <button
                  onClick={() => onDelete(recipe._id)}
                  className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecipesGrid;
