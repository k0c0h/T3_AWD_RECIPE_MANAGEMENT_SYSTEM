import { useState, useEffect } from "react";
import CostAnalysisStats from "../../views/costanalysis/CostAnalysisStats";
import CostAnalysisFilters from "../../views/costanalysis/CostAnalysisFilters";
import CostAnalysisTable from "../../views/costanalysis/CostAnalysisTable";
import CreateAnalysisPage from "../../views/costanalysis/CreateAnalysisPage";
import ConfirmationModal from "../../components/ui/ConfirmationModal";
import Toast from "../../components/ui/Toast";
import costAnalysisService from "../../services/costAnalysis";

const Costs = () => {
  const [analyses, setAnalyses] = useState([]);
  const [filteredAnalyses, setFilteredAnalyses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreatePage, setShowCreatePage] = useState(false);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, id: null, loading: false });

  const itemsPerPage = 10;

  useEffect(() => {
    loadAnalyses();
  }, []);

  useEffect(() => {
    filterAnalyses();
  }, [analyses, searchTerm]);

  const filterAnalyses = () => {
    let filtered = analyses;

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((analysis) =>
        analysis.recipeName?.toLowerCase().includes(search)
      );
    }

    setFilteredAnalyses(filtered);
    setCurrentPage(1);
  };

  const loadAnalyses = async () => {
    setIsLoading(true);
    try {
      const response = await costAnalysisService.getAll();
      setAnalyses(Array.isArray(response) ? response : []);
    } catch (error) {
      console.error("Error loading analyses:", error);
      showToast("Error al cargar análisis", "error");
      setAnalyses([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setConfirm({ open: true, id, loading: false });
  };

  const handleConfirmDelete = async () => {
    setConfirm((prev) => ({ ...prev, loading: true }));
    try {
      await costAnalysisService.remove(confirm.id);
      setAnalyses(analyses.filter((a) => a._id !== confirm.id));
      showToast("Análisis eliminado correctamente", "success");
      setConfirm({ open: false, id: null, loading: false });
    } catch (error) {
      console.error("Error deleting analysis:", error);
      showToast("Error al eliminar el análisis", "error");
      setConfirm((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleCreateSuccess = () => {
    setShowCreatePage(false);
    loadAnalyses();
  };

  const showToast = (message, type = "success") => {
    setToast({ id: Date.now(), message, type });
  };

  const totalCost = analyses.reduce((sum, a) => sum + (a.totalCost || 0), 0);
  const averageCost =
    analyses.length > 0 ? totalCost / analyses.length : 0;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAnalyses.slice(indexOfFirstItem, indexOfLastItem);

  if (showCreatePage) {
    return (
      <CreateAnalysisPage
        onBack={() => setShowCreatePage(false)}
        onSuccess={handleCreateSuccess}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: "#9FB9B3" }}></div>
          <p className="text-gray-600">Cargando análisis...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full">
        <CostAnalysisStats
          totalAnalyses={analyses.length}
          totalProductCost={totalCost}
          averageCost={averageCost}
        />

        <CostAnalysisFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onOpenCreate={() => setShowCreatePage(true)}
          analyses={analyses}
        />

        {filteredAnalyses.length === 0 ? (
          <div className="bg-white rounded-lg border p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg
                className="mx-auto h-24 w-24"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay análisis de costos
            </h3>
            <p className="text-gray-500 mb-6">
              Comienza creando tu primer análisis de costos
            </p>
            <button
              onClick={() => setShowCreatePage(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#adc4bc] text-white rounded-md hover:opacity-90 transition-all font-medium"
            >
              + Crear Primer Análisis
            </button>
          </div>
        ) : (
          <CostAnalysisTable
            analyses={currentItems}
            onView={setSelectedAnalysis}
            onDelete={handleDeleteClick}
            currentPage={currentPage}
            totalItems={filteredAnalyses.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <ConfirmationModal
        isOpen={confirm.open}
        title="Eliminar Análisis"
        message="¿Confirma que desea eliminar este análisis de costos?"
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onCancel={() => setConfirm({ open: false, id: null, loading: false })}
        loading={confirm.loading}
      />

      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </>
  );
};
  
export default Costs;