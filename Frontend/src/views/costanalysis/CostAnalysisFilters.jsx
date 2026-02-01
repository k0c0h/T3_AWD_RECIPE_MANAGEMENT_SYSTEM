import React, { useState } from 'react';
import { Search, MoreVertical } from 'lucide-react';

const CostAnalysisFilters = ({ searchTerm, onSearchChange, onOpenCreate, analyses }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleExport = (type) => {
    console.log('Exporting:', type);
    setShowExportMenu(false);
  };

  return (
    <div className="bg-white rounded-lg border p-4 mb-4">
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar análisis por nombre..."
            className="w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm"
            style={{ focusRingColor: '#9FB9B3' }}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <button
          onClick={onOpenCreate}
          className="px-4 py-2 text-white rounded-md font-medium hover:opacity-90"
          style={{ backgroundColor: '#9FB9B3' }}
        >
          Nuevo Análisis
        </button>
      </div>
    </div>
  );
};

export default CostAnalysisFilters;
