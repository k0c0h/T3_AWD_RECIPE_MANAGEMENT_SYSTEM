import React, { useState } from 'react';
import { Archive } from 'lucide-react';

const ConversionHistoryTable = ({ conversions, onDelete }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = conversions.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(conversions.length / itemsPerPage);

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Valor Inicial
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Resultado
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Ingrediente
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Densidad
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentItems.map((conv) => (
              <tr key={conv._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-700">
                  {new Date(conv.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {conv.value} {conv.fromUnit}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {conv.result?.toFixed(2)} {conv.toUnit}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {conv.ingredientName || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-700">
                  {conv.densityUsed}
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => onDelete(conv._id)}
                    className="text-red-600 hover:text-red-800"
                    title="Eliminar conversión"
                  >
                    <Archive className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 p-4 border-t">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50 hover:bg-gray-200"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50 hover:bg-gray-200"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default ConversionHistoryTable;