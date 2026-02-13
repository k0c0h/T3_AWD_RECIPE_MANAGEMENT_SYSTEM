import { useState, useEffect } from "react";
import { X, FileText, FileSpreadsheet, Check } from "lucide-react";
import ingredientExportService from "../../services/ingredientExport";

const ExportIngredientsModal = ({ isOpen, onClose, ingredients }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSuppliers, setSelectedSuppliers] = useState([]);
  const [exportFormat, setExportFormat] = useState("pdf");
  const [isExporting, setIsExporting] = useState(false);

  const categories = [...new Set(ingredients.map(ing => ing.category).filter(Boolean))].sort();
  const suppliers = [...new Set(ingredients.map(ing => ing.supplier).filter(Boolean))].sort();

  useEffect(() => {
    if (isOpen) {
      // Reset al abrir
      setSelectedCategories([]);
      setSelectedSuppliers([]);
      setExportFormat("pdf");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCategoryToggle = (category) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSupplierToggle = (supplier) => {
    setSelectedSuppliers(prev =>
      prev.includes(supplier)
        ? prev.filter(s => s !== supplier)
        : [...prev, supplier]
    );
  };

  const handleSelectAllCategories = () => {
    if (selectedCategories.length === categories.length) {
      setSelectedCategories([]);
    } else {
      setSelectedCategories([...categories]);
    }
  };

  const handleSelectAllSuppliers = () => {
    if (selectedSuppliers.length === suppliers.length) {
      setSelectedSuppliers([]);
    } else {
      setSelectedSuppliers([...suppliers]);
    }
  };

  const handleExport = () => {
    setIsExporting(true);
    try {
      const options = {
        selectedCategories,
        selectedSuppliers
      };

      if (exportFormat === "pdf") {
        ingredientExportService.exportToPDF(ingredients, options);
      } else {
        ingredientExportService.exportToExcel(ingredients, options);
      }

      setTimeout(() => {
        setIsExporting(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error("Error exporting:", error);
      setIsExporting(false);
    }
  };

  const filteredCount = ingredients.filter(ing => {
    if (selectedCategories.length > 0 && !selectedCategories.includes(ing.category)) {
      return false;
    }
    if (selectedSuppliers.length > 0 && !selectedSuppliers.includes(ing.supplier)) {
      return false;
    }
    return true;
  }).length;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ backgroundColor: "#f5f2eb", borderColor: "#e5dfd8" }}
        >
          <h2 className="text-xl font-semibold text-gray-800">
            Exportar Ingredientes
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Formato de exportación */}
          <div>
            <h3 className="font-semibold text-gray-700 mb-3">Formato de Exportación</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setExportFormat("pdf")}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                  exportFormat === "pdf"
                    ? "border-[#9FB9B3] bg-[#f5f2eb]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <FileText className="w-6 h-6 text-red-500" />
                <div className="text-left flex-1">
                  <div className="font-medium text-gray-800">PDF</div>
                  <div className="text-xs text-gray-500">
                    Documento imprimible
                  </div>
                </div>
                {exportFormat === "pdf" && (
                  <Check className="w-5 h-5 text-[#9FB9B3]" />
                )}
              </button>

              <button
                onClick={() => setExportFormat("excel")}
                className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${
                  exportFormat === "excel"
                    ? "border-[#9FB9B3] bg-[#f5f2eb]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <FileSpreadsheet className="w-6 h-6 text-green-600" />
                <div className="text-left flex-1">
                  <div className="font-medium text-gray-800">Excel</div>
                  <div className="text-xs text-gray-500">
                    Hoja de cálculo editable
                  </div>
                </div>
                {exportFormat === "excel" && (
                  <Check className="w-5 h-5 text-[#9FB9B3]" />
                )}
              </button>
            </div>
          </div>

          {/* Categorías */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700">
                Categorías ({selectedCategories.length}/{categories.length})
              </h3>
              <button
                onClick={handleSelectAllCategories}
                className="text-sm text-[#9FB9B3] hover:text-[#8aa59f] font-medium"
              >
                {selectedCategories.length === categories.length
                  ? "Deseleccionar todo"
                  : "Seleccionar todo"}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg" style={{ borderColor: "#e5dfd8" }}>
              {categories.map((category) => (
                <label
                  key={category}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="w-4 h-4 text-[#9FB9B3] focus:ring-[#9FB9B3]"
                  />
                  <span className="text-sm text-gray-700">{category}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Proveedores */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-700">
                Proveedores ({selectedSuppliers.length}/{suppliers.length})
              </h3>
              <button
                onClick={handleSelectAllSuppliers}
                className="text-sm text-[#9FB9B3] hover:text-[#8aa59f] font-medium"
              >
                {selectedSuppliers.length === suppliers.length
                  ? "Deseleccionar todo"
                  : "Seleccionar todo"}
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border rounded-lg" style={{ borderColor: "#e5dfd8" }}>
              {suppliers.map((supplier) => (
                <label
                  key={supplier}
                  className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedSuppliers.includes(supplier)}
                    onChange={() => handleSupplierToggle(supplier)}
                    className="w-4 h-4 text-[#9FB9B3] focus:ring-[#9FB9B3]"
                  />
                  <span className="text-sm text-gray-700">{supplier}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-[#f5f2eb] border rounded-lg p-4" style={{ borderColor: "#e5dfd8" }}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Total de ingredientes a exportar:</span>
              <span className="font-bold text-gray-800 text-lg">{filteredCount}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex flex-col sm:flex-row gap-3 justify-end" style={{ borderColor: "#e5dfd8" }}>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
            style={{ borderColor: "#e5dfd8" }}
          >
            Cancelar
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting || filteredCount === 0}
            className="px-6 py-2 text-white rounded-md font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 justify-center"
            style={{ backgroundColor: "#9FB9B3" }}
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Exportando...
              </>
            ) : (
              <>
                {exportFormat === "pdf" ? <FileText className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
                Exportar {exportFormat.toUpperCase()}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportIngredientsModal;
