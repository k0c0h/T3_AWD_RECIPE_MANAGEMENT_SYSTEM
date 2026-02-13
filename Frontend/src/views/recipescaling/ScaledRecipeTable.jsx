import { useState } from "react";
import { Eye, Trash2 } from "lucide-react";
import ScaledRecipeDetails from "./ScaledRecipeDetails";
import { Modal } from "../../components/ui/Modal";

const ScaledRecipeTable = ({
  scaledRecipes,
  onDelete,
  currentPage = 1,
  totalItems = 0,
  itemsPerPage = 10,
  onPageChange,
}) => {
  const [selectedScaledRecipe, setSelectedScaledRecipe] = useState(null);

  if (!scaledRecipes.length) {
    return (
      <div className="text-center text-gray-500 py-8">
        No hay escalados guardados
      </div>
    );
  }

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      {/* Mobile cards */}
      <div className="block lg:hidden p-3 sm:p-4 space-y-3">
        {scaledRecipes.map((scaled) => (
          <div 
            key={scaled._id} 
            className="p-3 sm:p-4 rounded-lg border hover:shadow-md transition-shadow" 
            style={{ borderColor: '#e5dfd8' }}
          >
            {/* Header Row */}
            <div className="flex items-start justify-between gap-2 sm:gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base truncate">
                  {scaled.recipeName}
                </h3>
                <div className="text-xs sm:text-sm text-gray-500 mt-1 flex flex-wrap gap-x-2">
                  <span>{scaled.scaling?.newServings || 0} porciones</span>
                  <span>•</span>
                  <span>{scaled.scaling?.scaleFactor?.toFixed(2) || '0.00'}x</span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm sm:text-base font-semibold text-gray-800">
                  ${scaled.costs?.totalCost?.toFixed(2) || "0.00"}
                </div>
                <div className="text-xs sm:text-sm text-green-600">
                  ${scaled.costs?.totalPrice?.toFixed(2) || "0.00"}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedScaledRecipe(scaled)}
                className="flex-1 px-3 py-2 text-xs sm:text-sm bg-[#f5f2eb] text-[#9bb3ac] rounded-md font-medium hover:bg-[#eae9e5] transition-colors"
              >
                Ver detalles
              </button>
              <button
                onClick={() => onDelete(scaled._id)}
                className="px-3 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                aria-label="Eliminar"
              >
                <Trash2 size={16} className="sm:hidden" />
                <span className="hidden sm:inline text-sm">Eliminar</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#f5f2eb] border-b-2 border-[#e7c78a]">
            <tr>
              <th className="text-left py-4 px-4 xl:px-6 text-sm font-semibold text-gray-700">
                Receta
              </th>
              <th className="text-left py-4 px-3 xl:px-4 text-sm font-semibold text-gray-700">
                Porc. Orig.
              </th>
              <th className="text-left py-4 px-3 xl:px-4 text-sm font-semibold text-gray-700">
                Porc. Nuevas
              </th>
              <th className="text-left py-4 px-3 xl:px-4 text-sm font-semibold text-gray-700">
                Factor
              </th>
              <th className="text-left py-4 px-3 xl:px-4 text-sm font-semibold text-gray-700">
                Costo Total
              </th>
              <th className="text-left py-4 px-3 xl:px-4 text-sm font-semibold text-gray-700">
                Precio Total
              </th>
              <th className="text-center py-4 px-3 xl:px-4 text-sm font-semibold text-gray-700">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {scaledRecipes.map((scaled) => (
              <tr
                key={scaled._id}
                className="border-b border-[#e7c78a] hover:bg-[#f5f2eb] transition-colors"
              >
                <td className="py-4 px-4 xl:px-6 font-medium text-gray-800">
                  {scaled.recipeName}
                </td>
                <td className="py-4 px-3 xl:px-4 text-gray-700">
                  {scaled.scaling?.originalServings || 0}
                </td>
                <td className="py-4 px-3 xl:px-4 font-semibold text-[#9bb3ac]">
                  {scaled.scaling?.newServings || 0}
                </td>
                <td className="py-4 px-3 xl:px-4 text-gray-700">
                  {scaled.scaling?.scaleFactor?.toFixed(2) || '0.00'}x
                </td>
                <td className="py-4 px-3 xl:px-4 font-semibold text-gray-800">
                  ${scaled.costs?.totalCost?.toFixed(2) || "0.00"}
                </td>
                <td className="py-4 px-3 xl:px-4 font-semibold text-green-600">
                  ${scaled.costs?.totalPrice?.toFixed(2) || "0.00"}
                </td>
                <td className="py-4 px-3 xl:px-4">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={() => setSelectedScaledRecipe(scaled)}
                      className="p-2 text-[#adc4bc] hover:bg-[#f5f2eb] rounded-lg transition-colors"
                      title="Ver detalles"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => onDelete(scaled._id)}
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
        <div className="bg-white border-t border-[#e7c78a] px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs sm:text-sm text-gray-600 order-2 sm:order-1">
            Página {currentPage} de {totalPages}
          </span>
          <div className="flex gap-2 order-1 sm:order-2 w-full sm:w-auto">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Anterior
            </button>
            <button
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex-1 sm:flex-none px-3 sm:px-4 py-2 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Modal para detalles */}
      {selectedScaledRecipe && (
        <Modal isOpen={!!selectedScaledRecipe} onClose={() => setSelectedScaledRecipe(null)}>
          <ScaledRecipeDetails scaledRecipe={selectedScaledRecipe} />
        </Modal>
      )}
    </div>
  );
};

export default ScaledRecipeTable;