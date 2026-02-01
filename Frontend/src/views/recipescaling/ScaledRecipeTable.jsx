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
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-[#f5f2eb] border-b-2 border-[#e7c78a]">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                Receta
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                Porciones Orig.
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                Porciones Nuevas
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                Factor
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                Costo Total
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                Precio Total
              </th>
              <th className="text-center py-4 px-6 text-sm font-semibold text-gray-700">
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
                <td className="py-4 px-6 font-medium text-gray-800">
                  {scaled.recipeName}
                </td>
                <td className="py-4 px-6">{scaled.scaling?.originalServings || 0}</td>
                <td className="py-4 px-6 font-semibold text-[#9bb3ac]">
                  {scaled.scaling?.newServings || 0}
                </td>
                <td className="py-4 px-6">
                  {scaled.scaling?.scaleFactor?.toFixed(2) || '0.00'}x
                </td>
                <td className="py-4 px-6 font-semibold text-gray-800">
                  ${scaled.costs?.totalCost?.toFixed(2) || "0.00"}
                </td>
                <td className="py-4 px-6 font-semibold text-green-600">
                  ${scaled.costs?.totalPrice?.toFixed(2) || "0.00"}
                </td>
                <td className="py-4 px-6">
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
      {selectedScaledRecipe && (
        <Modal isOpen={!!selectedScaledRecipe} onClose={() => setSelectedScaledRecipe(null)}>
          <ScaledRecipeDetails scaledRecipe={selectedScaledRecipe} />
        </Modal>
      )}
    </div>
  );
};

export default ScaledRecipeTable;
