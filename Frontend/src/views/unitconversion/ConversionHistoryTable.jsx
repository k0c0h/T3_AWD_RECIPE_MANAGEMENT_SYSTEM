import React, { useState } from 'react';
import { Archive, ArrowRight, Trash2 } from 'lucide-react';

const ConversionHistoryTable = ({ conversions, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = conversions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(conversions.length / itemsPerPage);

  if (!conversions.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 sm:p-12 text-center">
        <Archive className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 text-sm sm:text-base">
          No hay conversiones guardadas
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Vista de tabla para desktop */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 xl:px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Fecha
              </th>
              <th className="px-3 xl:px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Valor Inicial
              </th>
              <th className="px-3 xl:px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Resultado
              </th>
              <th className="px-3 xl:px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Ingrediente
              </th>
              <th className="px-3 xl:px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Densidad
              </th>
              <th className="px-3 xl:px-4 py-3 text-center text-xs font-medium text-gray-600 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentItems.map((conv) => (
              <tr key={conv._id} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 xl:px-4 py-3 text-sm text-gray-700 whitespace-nowrap">
                  {new Date(conv.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
                <td className="px-3 xl:px-4 py-3 text-sm text-gray-700">
                  {conv.value} {conv.fromUnit}
                </td>
                <td className="px-3 xl:px-4 py-3 text-sm font-medium text-gray-900">
                  {typeof conv.result === 'number' ? conv.result.toFixed(2) : conv.result} {conv.toUnit}
                </td>
                <td className="px-3 xl:px-4 py-3 text-sm text-gray-700">
                  {conv.ingredientName || '-'}
                </td>
                <td className="px-3 xl:px-4 py-3 text-sm text-gray-700">
                  {conv.densityUsed || '-'}
                </td>
                <td className="px-3 xl:px-4 py-3">
                  <div className="flex justify-center">
                    <button
                      onClick={() => onDelete(conv._id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      title="Eliminar conversión"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Vista de tarjetas para móvil y tablet */}
      <div className="lg:hidden divide-y divide-gray-100">
        {currentItems.map((conv) => (
          <div key={conv._id} className="p-3 sm:p-4 hover:bg-gray-50 transition-colors">
            {/* Header con fecha y botón eliminar */}
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-500 mb-1">
                  {new Date(conv.createdAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <button
                onClick={() => onDelete(conv._id)}
                className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1.5 rounded-lg transition-colors flex-shrink-0"
                title="Eliminar conversión"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            
            {/* Conversión visual */}
            <div className="flex items-center gap-2 mb-3 bg-gray-50 p-2.5 sm:p-3 rounded-lg">
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 mb-0.5">Valor inicial</div>
                <div className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                  {conv.value} {conv.fromUnit}
                </div>
              </div>
              
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
              
              <div className="flex-1 min-w-0 text-right">
                <div className="text-xs text-gray-500 mb-0.5">Resultado</div>
                <div className="text-sm sm:text-base font-semibold text-[#9FB9B3] truncate">
                  {typeof conv.result === 'number' ? conv.result.toFixed(2) : conv.result} {conv.toUnit}
                </div>
              </div>
            </div>
            
            {/* Detalles adicionales */}
            {(conv.ingredientName || conv.densityUsed) && (
              <div className="grid grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm pt-2 border-t border-gray-100">
                <div>
                  <span className="text-gray-500 block mb-0.5">Ingrediente:</span>
                  <p className="text-gray-700 font-medium truncate">
                    {conv.ingredientName || '-'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 block mb-0.5">Densidad:</span>
                  <p className="text-gray-700 font-medium truncate">
                    {conv.densityUsed || '-'}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-2 p-3 sm:p-4 border-t border-gray-200">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="w-full sm:w-auto px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700"
          >
            Anterior
          </button>
          <span className="text-xs sm:text-sm text-gray-600 min-w-[100px] text-center order-first sm:order-none">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="w-full sm:w-auto px-4 py-2 bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors text-sm font-medium text-gray-700"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default ConversionHistoryTable;