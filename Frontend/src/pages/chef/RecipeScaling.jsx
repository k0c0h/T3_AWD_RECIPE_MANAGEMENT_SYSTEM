import React, { useState, useEffect } from "react";
import { Maximize2, ArrowLeft } from "lucide-react";
import recipeService from "../../services/recipe";
import recipeScalingService from "../../services/recipeScaling";
import RecipeScalingForm from "../../views/recipescaling/RecipeScalingForm";
import ScaledIngredientsTable from "../../views/recipescaling/ScaledIngredientsTable";
import ScaledRecipeFilters from "../../views/recipescaling/ScaledRecipeFilters";
import ScaledRecipeTable from "../../views/recipescaling/ScaledRecipeTable";
import Toast from "../../components/ui/Toast";
import ConfirmationModal from "../../components/ui/ConfirmationModal";

export default function RecipeScaling() {
  const [recipes, setRecipes] = useState([]);
  const [scaledRecipes, setScaledRecipes] = useState([]);
  const [filteredScaledRecipes, setFilteredScaledRecipes] = useState([]);
  const [scaledResult, setScaledResult] = useState(null);
  const [lastScalingData, setLastScalingData] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showNewScaling, setShowNewScaling] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [confirm, setConfirm] = useState({ open: false, id: null, loading: false });

  const itemsPerPage = 10;

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    filterScaledRecipes();
  }, [scaledRecipes, searchTerm]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadRecipes(), loadScaledRecipes()]);
    } catch (error) {
      showToast({ type: "error", message: "Error cargando datos" });
    } finally {
      setLoading(false);
    }
  };

  const loadRecipes = async () => {
    try {
      const res = await recipeService.getAll();
      setRecipes(Array.isArray(res) ? res : res.data);
    } catch (error) {
      console.error("Error loading recipes:", error);
      showToast({ type: "error", message: "Error cargando recetas" });
    }
  };

  const loadScaledRecipes = async () => {
    try {
      const res = await recipeScalingService.getAll();
      setScaledRecipes(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Error loading scaled recipes:", error);
      showToast({ type: "error", message: "Error cargando escalados" });
      setScaledRecipes([]);
    }
  };

  const filterScaledRecipes = () => {
    let filtered = scaledRecipes;

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((scaled) =>
        scaled.recipeName?.toLowerCase().includes(search)
      );
    }

    setFilteredScaledRecipes(filtered);
    setCurrentPage(1);
  };

  const showToast = (config) => {
    setToast({ ...config, id: Date.now() });
  };

  const handleScale = async ({ recipeId, newServings, profitMargin }) => {
    try {
      const res = await recipeScalingService.scaleRecipe(recipeId, {
        newServings,
        profitMargin
      });

      setScaledResult(res.scaledRecipe);
      setLastScalingData({ recipeId, newServings, profitMargin });
      showToast({ type: "success", message: "Receta calculada. Revisa los resultados y presiona 'Guardar' para confirmar." });
    } catch (error) {
      console.error("Error scaling recipe:", error);
      showToast({ type: "error", message: "Error al calcular escalado" });
    }
  };

  const handleSaveScaling = async () => {
    if (!scaledResult || !scaledResult._id) {
      showToast({ type: "error", message: "No hay escalado para guardar" });
      return;
    }

    setSaving(true);
    try {
      await loadScaledRecipes();
      showToast({ type: "success", message: "Escalado guardado correctamente" });
      handleBackToList();
    } catch (error) {
      console.error("Error saving scaled recipe:", error);
      showToast({ type: "error", message: "Error al guardar el escalado" });
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardScaling = async () => {
    if (scaledResult && scaledResult._id) {
      try {
        await recipeScalingService.delete(scaledResult._id);
      } catch (error) {
        console.error("Error discarding scaled recipe:", error);
      }
    }
    setScaledResult(null);
    setLastScalingData(null);
    showToast({ type: "info", message: "Escalado descartado" });
  };

  const handleDeleteClick = (id) => {
    setConfirm({ open: true, id, loading: false });
  };

  const handleConfirmDelete = async () => {
    setConfirm((prev) => ({ ...prev, loading: true }));
    try {
      await recipeScalingService.delete(confirm.id);
      setScaledRecipes(scaledRecipes.filter((s) => s._id !== confirm.id));
      showToast({ type: "success", message: "Escalado eliminado correctamente" });
      setConfirm({ open: false, id: null, loading: false });
    } catch (error) {
      console.error("Error deleting scaled recipe:", error);
      showToast({ type: "error", message: "Error al eliminar el escalado" });
      setConfirm((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleNewScaling = () => {
    setShowNewScaling(true);
    setScaledResult(null);
  };

  const handleBackToList = async () => {
    if (scaledResult && scaledResult._id && lastScalingData) {
      try {
        await recipeScalingService.delete(scaledResult._id);
      } catch (error) {
        console.error("Error cleaning up scaled recipe:", error);
      }
    }
    setShowNewScaling(false);
    setScaledResult(null);
    setLastScalingData(null);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredScaledRecipes.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "#9bb3ac" }}></div>
          <p className="text-gray-600 text-sm sm:text-base">Cargando...</p>
        </div>
      </div>
    );
  }

  // Vista de nuevo escalado
  if (showNewScaling) {
    return (
      <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">
        <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2 mb-1">
                <Maximize2 className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                <span className="truncate">Nuevo Escalado</span>
              </h1>
              <p className="text-xs sm:text-sm md:text-base text-gray-600">
                Ajusta cantidades, costos y suministros según nuevas porciones
              </p>
            </div>
            <button
              onClick={handleBackToList}
              className="w-full sm:w-auto px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
            >
              <ArrowLeft size={18} className="flex-shrink-0" />
              <span className="hidden xs:inline">Volver al listado</span>
              <span className="xs:hidden">Volver</span>
            </button>
          </div>

          {/* Form */}
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <RecipeScalingForm
              recipes={recipes}
              onScale={handleScale}
            />
          </div>

          {/* Results */}
          {scaledResult && (
            <>
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <ScaledIngredientsTable scaledRecipe={scaledResult} />
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <button
                    onClick={handleDiscardScaling}
                    className="w-full sm:w-auto px-6 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={saving}
                  >
                    Descartar
                  </button>
                  <button
                    onClick={handleSaveScaling}
                    className="w-full sm:w-auto px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Guardando...
                      </>
                    ) : (
                      "Guardar Escalado"
                    )}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    );
  }

  // Vista de listado principal
  return (
    <div className="h-full p-3 sm:p-4 md:p-0">
      {/* Filters */}
      <ScaledRecipeFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onNewScaling={handleNewScaling}
      />

      {/* Table or Empty State */}
      {filteredScaledRecipes.length === 0 ? (
        <div className="bg-white rounded-lg border p-6 sm:p-8 md:p-12 text-center">
          <div className="text-gray-400 mb-4">
            <Maximize2 className="mx-auto h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24" strokeWidth={1.5} />
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
            No hay escalados de recetas
          </h3>
          <p className="text-sm sm:text-base text-gray-500 mb-6">
            Comienza creando tu primer escalado de receta
          </p>
          <button
            onClick={handleNewScaling}
            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-[#9bb3ac] text-white rounded-md hover:bg-[#adc4bc] transition-all font-medium text-sm sm:text-base"
          >
            + Crear Primer Escalado
          </button>
        </div>
      ) : (
        <ScaledRecipeTable
          scaledRecipes={currentItems}
          onDelete={handleDeleteClick}
          currentPage={currentPage}
          totalItems={filteredScaledRecipes.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      <ConfirmationModal
        isOpen={confirm.open}
        title="Eliminar Escalado"
        message="¿Confirma que desea eliminar este escalado de receta?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirm({ open: false, id: null, loading: false })}
        loading={confirm.loading}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}