import { useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import CostAnalysisDetails from "./CostAnalysisDetails";
import { Modal } from "../../components/ui/Modal"; 

const CostAnalysisTable = ({
  analyses,
  onDelete,
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
}) => {
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);

  if (!analyses.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        No hay análisis disponibles
      </div>
    );
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#f5f2eb] border-b-2 border-[#e7c78a]">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                Receta
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                Porciones
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                Costo/Porción
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                Precio Sugerido
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                Total
              </th>
              <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {analyses.map((analysis) => (
              <tr
                key={analysis._id}
                className="border-b border-[#e7c78a] hover:bg-[#f5f2eb] transition-colors"
              >
                <td className="py-4 px-6 font-medium text-gray-800">
                  {analysis.recipeName}
                </td>
                <td className="py-4 px-6">{analysis.servings}</td>
                <td className="py-4 px-6 font-semibold text-gray-800">
                  ${analysis.costPerServing?.toFixed(2) || "0.00"}
                </td>
                <td className="py-4 px-6 font-semibold text-[#adc4bc]">
                  ${analysis.suggestedPricePerServing?.toFixed(2) || "0.00"}
                </td>
                <td className="py-4 px-6 font-semibold text-gray-800">
                  ${analysis.totalCost?.toFixed(2) || "0.00"}
                </td>
                <td className="py-4 px-6">
                  <div className="flex items-center justify-center gap-2">
                    {/* Abrir modal */}
                    <button
                      onClick={() => setSelectedAnalysis(analysis)}
                      className="p-2 text-[#adc4bc] hover:bg-[#f5f2eb] rounded-lg transition-colors"
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(analysis._id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white border-t border-[#e7c78a] px-6 py-4 flex items-center justify-between">
          <span className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-50"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded-md disabled:opacity-50 hover:bg-gray-50"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal para detalles */}
      {selectedAnalysis && (
        <Modal isOpen={!!selectedAnalysis} onClose={() => setSelectedAnalysis(null)}>
          <CostAnalysisDetails analysis={selectedAnalysis} />
        </Modal>
      )}
    </div>
  );
};

export default CostAnalysisTable;
