import React from 'react';
import { Search, Plus } from 'lucide-react';

const ScaledRecipeFilters = ({ searchTerm, onSearchChange, onNewScaling }) => {
  return (
    <div className="bg-white rounded-lg border p-4 mb-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por nombre de receta..."
            className="w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#9bb3ac] focus:ring-opacity-50 text-sm"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <button
          onClick={onNewScaling}
          className="px-4 py-2 bg-[#9bb3ac] text-white rounded-md font-medium hover:bg-[#adc4bc] flex items-center gap-2 justify-center"
        >
          <Plus size={18} />
          Nuevo Escalado
        </button>
      </div>
    </div>
  );
};

export default ScaledRecipeFilters;
