import React, { useState } from 'react';
import { Search, Plus, Download, FileText, FileSpreadsheet, Filter as FilterIcon, Tag, Package } from 'lucide-react';

const IngredientsFilters = ({ 
  searchTerm, 
  onSearchChange, 
  selectedCategory, 
  onCategoryChange,
  viewMode,
  onViewModeChange,
  onOpenModal,
  categories 
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  const exportOptions = [
    { id: 'pdf', label: 'Exportar PDF', icon: FileText },
    { id: 'excel', label: 'Exportar Excel', icon: FileSpreadsheet },
    { id: 'advanced', label: 'Exportar con Filtros Avanzados', icon: FilterIcon },
    { id: 'category', label: 'Exportar por Categoría', icon: Tag },
    { id: 'inventory', label: 'Exportar Inventario con Totales', icon: Package }
  ];

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
            placeholder="Buscar por nombre, producto o código..."
            className="w-full pl-9 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm"
            style={{ focusRingColor: '#9FB9B3' }}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <select
          className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 bg-white text-sm"
          style={{ focusRingColor: '#9FB9B3' }}
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
            className={`px-3 py-2 rounded-md font-medium transition-colors text-sm ${
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
            className={`px-3 py-2 rounded-md font-medium transition-colors text-sm ${
              viewMode === 'deleted' 
                ? 'text-white' 
                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
            }`}
            style={viewMode === 'deleted' ? { backgroundColor: '#D4B5A5' } : {}}
          >
            Archivados
          </button>
        </div>

        {/* Export Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-4 py-2 text-white rounded-md font-medium hover:opacity-90 transition-opacity flex items-center gap-2 text-sm"
            style={{ backgroundColor: '#e7c78a' }}
          >
            <Download className="w-4 h-4" />
            Exportar
          </button>
          
          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-10" style={{ borderColor: '#E8D5C7' }}>
              {exportOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleExport(option.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left text-sm border-b last:border-b-0"
                    style={{ borderColor: '#F1F1F1' }}
                  >
                    <Icon className="w-4 h-4" style={{ color: '#9FB9B3' }} />
                    <span className="text-gray-700">{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <button 
          onClick={onOpenModal}
          className="px-4 py-2 text-white rounded-md font-medium hover:opacity-90 transition-opacity flex items-center gap-2 text-sm"
          style={{ backgroundColor: '#D4B5A5' }}
        >
          <Plus className="w-4 h-4" />
          Nuevo
        </button>
      </div>
    </div>
  );
};

export default IngredientsFilters;