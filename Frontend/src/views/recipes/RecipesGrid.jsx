import React from "react";
import { Eye, Pencil, Trash2 } from "lucide-react";

const RecipesGrid = ({ recipes, onView, onEdit, onDelete }) => {
  if (!recipes.length) {
    return (
      <p className="text-center text-gray-500 mt-8">
        No hay recetas disponibles
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {recipes.map((recipe) => (
        <div
          key={recipe._id}
          className="rounded-lg p-4 shadow-sm flex flex-col justify-between"
          style={{ backgroundColor: "#adc4bc" }}
        >
          <div>
            <p className="text-sm text-white/80">
              {recipe.category}
            </p>
            <h3 className="text-xl font-bold text-white mt-1">
              {recipe.name}
            </h3>

            <p className="text-white/90 text-sm mt-2 line-clamp-3">
              {recipe.description || "Sin descripción"}
            </p>

            <p className="text-xs text-white/70 mt-2">
              🍽 {recipe.servings} porciones
            </p>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => onView(recipe)}
              className="p-2 rounded bg-white/20 hover:bg-white/30 text-white"
            >
              <Eye size={16} />
            </button>

            <button
              onClick={() => onEdit(recipe)}
              className="p-2 rounded bg-white/20 hover:bg-white/30 text-white"
            >
              <Pencil size={16} />
            </button>

            <button
              onClick={() => onDelete(recipe._id)}
              className="p-2 rounded bg-red-500 hover:bg-red-600 text-white"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecipesGrid;
