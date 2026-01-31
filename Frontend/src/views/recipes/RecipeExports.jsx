import React, { useState } from "react";
import { Search, Plus, Download, FileText, FileSpreadsheet, Filter as FilterIcon } from "lucide-react";

const RecipeExports = ({
  search,
  onSearch,
  category,
  onCategory,
  minServings,
  onMinServings,
  maxTime,
  onMaxTime,
  onNew,
  onExport
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const exportOptions = [
    { id: "csv", label: "Exportar CSV", icon: FileSpreadsheet },
    { id: "pdf", label: "Exportar PDF", icon: FileText },
  ];

  const handleExportClick = (type) => {
    onExport(type);
    setShowExportMenu(false);
  };

  const categories = [
    "", // para "Todas las categorías"
    "cocktail",
    "appetizer",
    "main_course",
    "dessert",
    "beverage",
  ];

  return (
    <div className="bg-white rounded-lg border p-4 mb-4">
      <div className="flex flex-col md:flex-row gap-3 items-center">
        {/* Buscar */}
        <div className="flex-1 relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por nombre..."
            className="w-full md:w-64 pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm"
            style={{ focusRingColor: "#9FB9B3" }}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {/* Categoría */}
        <select
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 bg-white text-sm"
          style={{ focusRingColor: "#9FB9B3" }}
          value={category}
          onChange={(e) => onCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat === "" ? "Todas las categorías" : cat}
            </option>
          ))}
        </select>

        {/* Min porciones */}
        <label className="sr-only" htmlFor="min-servings">Mínimo porciones</label>
        <input
          type="number"
          min="0"
          value={minServings}
          onChange={(e) => onMinServings(Number(e.target.value))}
          placeholder="Mínimo porciones"
          className="border rounded px-3 py-2 w-40 text-sm"
        />

        {/* Tiempo máximo */}
        <label className="sr-only" htmlFor="max-time">Tiempo máximo (min)</label>
        <input
          type="number"
          min="0"
          value={maxTime}
          onChange={(e) => onMaxTime(Number(e.target.value))}
          placeholder="Tiempo máximo (min)"
          className="border rounded px-3 py-2 w-48 text-sm"
        />

        {/* Exportar con menú */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-4 py-2 text-white rounded-md font-medium hover:opacity-90 transition-opacity flex items-center gap-2 text-sm"
            style={{ backgroundColor: "#e7c78a" }}
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>

          {showExportMenu && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-10"
              style={{ borderColor: "#E8D5C7" }}
            >
              {exportOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleExportClick(option.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left text-sm border-b last:border-b-0"
                    style={{ borderColor: "#F1F1F1" }}
                  >
                    <Icon className="w-4 h-4" style={{ color: "#9FB9B3" }} />
                    <span className="text-gray-700">{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeExports;
