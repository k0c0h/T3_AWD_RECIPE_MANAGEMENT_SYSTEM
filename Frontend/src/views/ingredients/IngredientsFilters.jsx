import React from 'react';
import { Search, Plus, Download } from 'lucide-react';

const IngredientsFilters = ({ 
  searchTerm, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange,
  viewMode,
  onViewModeChange,
  onOpenModal,
  onOpenExportModal,
  categories 
}) => {
  return (
    <div className="bg-white rounded-lg border p-4 mb-4 shadow-sm" style={{ borderColor: "#e5dfd8" }}>
      {/* Primera fila: Búsqueda y botones principales */}
      <div className="flex flex-col lg:flex-row gap-3 mb-3 lg:mb-0">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar por nombre, producto o código..."
            className="w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent text-sm"
            style={{ borderColor: "#e5dfd8" }}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onOpenModal()}
            className="flex-1 sm:flex-none px-4 py-2 text-white rounded-md font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm"
            style={{ backgroundColor: '#9FB9B3' }}
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nuevo</span>
          </button>
          
          <button 
            onClick={onOpenExportModal}
            className="flex-1 sm:flex-none px-4 py-2 text-white rounded-md font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm"
            style={{ backgroundColor: '#e7c78a' }}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportar</span>
          </button>
        </div>
      </div>

      {/* Segunda fila: Filtros */}
      <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t" style={{ borderColor: "#e5dfd8" }}>
        <select
          className="flex-1 sm:max-w-xs px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent bg-white text-sm"
          style={{ borderColor: "#e5dfd8" }}
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === 'all' ? 'Todas las categorías' : cat}
            </option>
          ))}
        </select>

        <div className="flex gap-2">
          <button
            onClick={() => onViewModeChange('active')}
            className={`flex-1 sm:flex-none px-3 py-2 rounded-md font-medium transition-colors text-sm ${
              viewMode === 'active' 
                ? 'text-white' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
            style={viewMode === 'active' ? { backgroundColor: '#9FB9B3' } : {}}
          >
            Activos
          </button>
          <button
            onClick={() => onViewModeChange('deleted')}
            className={`flex-1 sm:flex-none px-3 py-2 rounded-md font-medium transition-colors text-sm ${
              viewMode === 'deleted' 
                ? 'text-white' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
            style={viewMode === 'deleted' ? { backgroundColor: '#D4B5A5' } : {}}
          >
            Archivados
          </button>
        </div>
      </div>
    </div>
  );
};

export default IngredientsFilters;