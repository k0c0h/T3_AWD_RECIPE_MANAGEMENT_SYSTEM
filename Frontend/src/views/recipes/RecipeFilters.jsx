import React, { useState } from "react";
import { Download, FileSpreadsheet, FileText } from "lucide-react";

const RecipeFilters = ({
  search,
  onSearch,
  category,
  onCategory,
  onNew,
  onExport,
}) => {
  const [openExport, setOpenExport] = useState(false);

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8 bg-[#f5f2eb] p-4 rounded-xl shadow-sm items-center">
      <input
        type="text"
        placeholder="Buscar receta (mín. 3 letras)..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        className="border rounded-md px-3 py-2 w-full md:w-1/3"
      />
      {/* Categoría */}
      <select
        value={category}
        onChange={(e) => onCategory(e.target.value)}
        className="px-4 py-2 rounded-lg border w-full md:w-1/4"
      >
        <option value="">Todas</option>
        <option value="cocktail">Cóctel</option>
        <option value="main">Plato fuerte</option>
        <option value="dessert">Postre</option>
        <option value="appetizer">Aperitivo</option>
      </select>

      {/* Exportar */}
      <div className="relative">
        <button
          onClick={() => setOpenExport(!openExport)}
          className="px-5 py-2 rounded-lg text-white font-medium bg-[#e7c78a] hover:opacity-90 flex items-center gap-2"
        >
          <Download size={16} />
          Exportar
        </button>

        {openExport && (
          <div className="absolute mt-2 w-48 bg-white border rounded-lg shadow z-10">
            <button
              onClick={() => {
                onExport("csv");
                setOpenExport(false);
              }}
              className="w-full px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50"
            >
              <FileSpreadsheet size={16} />
              Exportar CSV
            </button>

            <button
              onClick={() => {
                onExport("pdf");
                setOpenExport(false);
              }}
              className="w-full px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50"
            >
              <FileText size={16} />
              Exportar PDF
            </button>
          </div>
        )}
      </div>

      {/* Nueva receta */}
      <button
        onClick={onNew}
        className="px-5 py-2 rounded-lg text-white font-medium md:ml-auto bg-[#adc4bc] hover:bg-[#9fb9b3]"
      >
        + Nueva receta
      </button>
    </div>
  );
};

export default RecipeFilters;
