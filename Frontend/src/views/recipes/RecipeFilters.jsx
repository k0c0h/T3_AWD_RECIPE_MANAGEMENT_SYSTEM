import React from "react";

const RecipeFilters = ({
  search,
  onSearch,
  category,
  onCategory,
  onNew,
}) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <input
        type="text"
        placeholder="Buscar receta (mín. 3 letras)..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        className="border rounded-md px-3 py-2 w-full md:w-1/3"
      />

      <select
        value={category}
        onChange={(e) => onCategory(e.target.value)}
        className="border rounded-md px-3 py-2 w-full md:w-1/4"
      >
        <option value="">Todas las categorías</option>
        <option value="Entrada">cocktail</option>
        <option value="Plato fuerte">Beverage</option>
        <option value="Postre">Dessert</option>
        <option value="Bebida">Main Course</option>
        <option value="Aperitivo">Appetizer</option>
      </select>

      <button
        onClick={onNew}
        className="px-4 py-2 text-white rounded-md md:ml-auto"
        style={{ backgroundColor: "#9FB9B3" }}
      >
        Nueva receta
      </button>
    </div>
  );
};

export default RecipeFilters;
