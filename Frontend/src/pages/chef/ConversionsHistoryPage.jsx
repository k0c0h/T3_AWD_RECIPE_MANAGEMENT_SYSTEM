import React, { useState, useEffect } from 'react';
import { Search, ArrowLeft, Trash2, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import unitConversionService from '../../services/unitconversion';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import Toast from '../../components/ui/Toast';

export default function ConversionsHistoryPage() {
  const navigate = useNavigate();
  const [conversions, setConversions] = useState([]);
  const [filteredConversions, setFilteredConversions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, weight, volume
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });

  const itemsPerPage = 10;

  useEffect(() => {
    loadConversions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [conversions, searchTerm, filterType]);

  const loadConversions = async () => {
    setLoading(true);
    try {
      const response = await unitConversionService.getAll();
      const data = (response.data || response || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setConversions(data);
    } catch (error) {
      console.error('Error loading conversions:', error);
      showToast({ type: 'error', message: 'Error cargando historial' });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = conversions;

    // Filter by search term
    if (searchTerm) {
      result = result.filter(c =>
        (c.ingredientName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (c.fromUnit?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (c.toUnit?.toLowerCase() || '').includes(searchTerm.toLowerCase())
      );
    }

    // Filter by type
    if (filterType === 'weight') {
      result = result.filter(c => {
        const weightUnits = ['g', 'kg', 'oz', 'lb', 'mg'];
        return weightUnits.includes(c.fromUnit) || weightUnits.includes(c.toUnit);
      });
    } else if (filterType === 'volume') {
      result = result.filter(c => {
        const volumeUnits = ['ml', 'l', 'cups', 'tbsp', 'tsp', 'fl oz'];
        return volumeUnits.includes(c.fromUnit) || volumeUnits.includes(c.toUnit);
      });
    }

    setFilteredConversions(result);
    setCurrentPage(1);
  };

  const showToast = (config) => {
    const id = Date.now();
    setToast({ ...config, id });
  };

  const handleDelete = async () => {
    try {
      await unitConversionService.delete(confirmModal.id);
      setConversions(prev => prev.filter(c => c._id !== confirmModal.id));
      showToast({ type: 'success', message: 'Conversión eliminada' });
    } catch (error) {
      showToast({ type: 'error', message: 'Error al eliminar' });
    } finally {
      setConfirmModal({ isOpen: false, id: null });
    }
  };

  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = filteredConversions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredConversions.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Encabezado */}
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/unit-conversion')}
            className="p-2 hover:bg-gray-200 rounded-lg transition flex-shrink-0 mt-1 sm:mt-0"
            title="Volver"
          >
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 truncate">
              Historial de Conversiones
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Administra tus conversiones previas
            </p>
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-3 gap-3 sm:gap-4">
            <div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Total</div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#9FB9B3]">
                {conversions.length}
              </div>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Mostrando</div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#E8C8A0]">
                {currentItems.length}
              </div>
            </div>
            <div>
              <div className="text-xs sm:text-sm text-gray-600 mb-1 truncate">
                Con Ingred.
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-[#D4A89C]">
                {conversions.filter(c => c.ingredientName).length}
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Búsqueda */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Buscar
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Ingrediente, unidad..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent"
                />
              </div>
            </div>

            {/* Filtro por tipo */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                Tipo de Conversión
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent"
              >
                <option value="all">Todas</option>
                <option value="weight">Peso</option>
                <option value="volume">Volumen</option>
              </select>
            </div>

            {/* Botón limpiar filtros */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                }}
                className="w-full px-4 py-2 text-sm sm:text-base bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-medium"
              >
                Limpiar Filtros
              </button>
            </div>
          </div>
        </div>

        {/* Tabla / Cards */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#9FB9B3] mx-auto mb-4"></div>
            <p className="text-sm sm:text-base">Cargando...</p>
          </div>
        ) : filteredConversions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
            <p className="text-gray-500 text-base sm:text-lg">
              No hay conversiones para mostrar
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Cards */}
            <div className="block lg:hidden space-y-3 mb-6">
              {currentItems.map((conv) => (
                <div 
                  key={conv._id} 
                  className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition"
                >
                  {/* Header with date and delete */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span>
                        {new Date(conv.createdAt).toLocaleDateString('es-ES', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <button
                      onClick={() => setConfirmModal({ isOpen: true, id: conv._id })}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 rounded transition"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Conversion display */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-600 mb-1">Valor inicial</div>
                      <div className="text-base font-semibold text-gray-900 truncate">
                        {conv.value} {conv.fromUnit}
                      </div>
                    </div>
                    
                    <ArrowRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0 text-right">
                      <div className="text-sm text-gray-600 mb-1">Resultado</div>
                      <div className="text-base font-semibold text-[#9FB9B3] truncate">
                        {typeof conv.result === 'number' 
                          ? conv.result.toFixed(2) 
                          : conv.result} {conv.toUnit}
                      </div>
                    </div>
                  </div>

                  {/* Additional info */}
                  {(conv.ingredientName || conv.densityUsed) && (
                    <div className="pt-3 border-t border-gray-100 space-y-1">
                      {conv.ingredientName && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Ingrediente:</span>
                          <span className="text-gray-700 font-medium">{conv.ingredientName}</span>
                        </div>
                      )}
                      {conv.densityUsed && (
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-500">Densidad:</span>
                          <span className="text-gray-700 font-medium">{conv.densityUsed}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Fecha
                      </th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Valor Inicial
                      </th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Resultado
                      </th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Ingrediente
                      </th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Densidad
                      </th>
                      <th className="px-4 xl:px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                        Acción
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {currentItems.map((conv) => (
                      <tr key={conv._id} className="hover:bg-gray-50 transition">
                        <td className="px-4 xl:px-6 py-4 text-sm text-gray-700">
                          {new Date(conv.createdAt).toLocaleDateString('es-ES', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="px-4 xl:px-6 py-4 text-sm font-medium text-gray-900">
                          {conv.value} {conv.fromUnit}
                        </td>
                        <td className="px-4 xl:px-6 py-4 text-sm font-medium text-[#9FB9B3]">
                          {typeof conv.result === 'number' 
                            ? conv.result.toFixed(2) 
                            : conv.result} {conv.toUnit}
                        </td>
                        <td className="px-4 xl:px-6 py-4 text-sm text-gray-700">
                          {conv.ingredientName || '-'}
                        </td>
                        <td className="px-4 xl:px-6 py-4 text-sm text-gray-700">
                          {conv.densityUsed || '-'}
                        </td>
                        <td className="px-4 xl:px-6 py-4">
                          <button
                            onClick={() => setConfirmModal({ isOpen: true, id: conv._id })}
                            className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded transition"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="w-full sm:w-auto px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition"
                >
                  Anterior
                </button>
                <span className="text-xs sm:text-sm text-gray-600 min-w-[100px] text-center order-first sm:order-none">
                  Página {currentPage} de {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="w-full sm:w-auto px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        title="Eliminar Conversión"
        message="¿Estás seguro de que deseas eliminar esta conversión? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setConfirmModal({ isOpen: false, id: null })}
        confirmText="Eliminar"
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}