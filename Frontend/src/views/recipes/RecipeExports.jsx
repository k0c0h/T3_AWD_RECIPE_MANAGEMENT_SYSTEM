import React, { useState } from "react";
import {
  Search,
  Download,
  FileText,
  FileSpreadsheet,
  SlidersHorizontal
} from "lucide-react";

const RecipeExports = ({
  search,
  onSearch,
  category,
  onCategory,
  minServings,
  onMinServings,
  maxTime,
  onMaxTime,
  onExport,
}) => {
  const [open, setOpen] = useState(false);

  const exportOptions = [
    { id: "csv", label: "Exportar CSV", icon: FileSpreadsheet },
    { id: "pdf", label: "Exportar PDF", icon: FileText },
  ];

  const categories = [
    { value: "", label: "Todas las categorías" },
    { value: "cocktail", label: "Cocktail" },
    { value: "appetizer", label: "Aperitivo" },
    { value: "main_course", label: "Plato principal" },
    { value: "dessert", label: "Postre" },
    { value: "beverage", label: "Bebida" },
  ];

  return (
    <div className="bg-white rounded-xl border p-4 mb-4">
      <div className="flex flex-col md:flex-row gap-3 items-center">
        {/* BUSCADOR */}
        <div className="flex-1 relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar receta..."
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-[#9FB9B3]"
          />
        </div>

        {/* BOTÓN PRINCIPAL */}
        <div className="relative w-full md:w-auto">
          <button
            onClick={() => setOpen(!open)}
            className="w-full md:w-56 px-5 py-2 rounded-lg text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition"
            style={{ backgroundColor: "#e7c78a" }}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filtros & Exportar
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border z-20 p-4 space-y-4">
              {/* FILTROS */}
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  Filtros
                </p>

                {/* Categoría */}
                <select
                  value={category}
                  onChange={(e) => onCategory(e.target.value)}
                  className="w-full border rounded-md px-3 py-2 text-sm mb-2"
                >
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>

                {/* Porciones */}
                <select
                  value={minServings}
                  onChange={(e) => onMinServings(Number(e.target.value))}
                  className="w-full border rounded-md px-3 py-2 text-sm mb-2"
                >
                  <option value={0}>Cualquier porción</option>
                  <option value={1}>1+ porciones</option>
                  <option value={2}>2+ porciones</option>
                  <option value={4}>4+ porciones</option>
                  <option value={6}>6+ porciones</option>
                </select>

                {/* Tiempo */}
                <select
                  value={maxTime}
                  onChange={(e) => onMaxTime(Number(e.target.value))}
                  className="w-full border rounded-md px-3 py-2 text-sm"
                >
                  <option value={0}>Cualquier tiempo</option>
                  <option value={15}>≤ 15 minutos</option>
                  <option value={30}>≤ 30 minutos</option>
                  <option value={60}>≤ 1 hora</option>
                </select>
              </div>

              {/* EXPORTAR */}
              <div className="border-t pt-3">
                <p className="text-xs font-semibold text-gray-500 mb-2">
                  Exportar
                </p>

                {exportOptions.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => {
                        onExport(opt.id);
                        setOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-gray-50 text-sm"
                    >
                      <Icon className="w-4 h-4 text-[#9FB9B3]" />
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeExports;
