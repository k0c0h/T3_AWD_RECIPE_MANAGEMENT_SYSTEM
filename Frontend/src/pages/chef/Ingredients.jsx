import React, { useState, useEffect } from 'react';
import ingredientService from '../../services/ingredient';
import IngredientsStats from '../../views/ingredients/IngredientsStats';
import IngredientsFilters from '../../views/ingredients/IngredientsFilters';
import IngredientsTable from '../../views/ingredients/IngredientsTable';
import IngredientsModal from '../../views/ingredients/IngredientsModal';
import ExportIngredientsModal from '../../views/ingredients/ExportIngredientsModal';
import ConfirmationModal from '../../components/ui/ConfirmationModal';
import Toast from '../../components/ui/Toast';

const Ingredients = () => {
  const [ingredients, setIngredients] = useState([]);
  const [filteredIngredients, setFilteredIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('active');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, action: null, payload: null, loading: false });

  const categories = ['all', 'Licores', 'Insumos', 'Adicionales', 'Bebidas', 'Hierbas y Especias', 'Harinas y Cereales', 'Frutas y Vegetales','Proteínas'];

  useEffect(() => {
    loadIngredients();
  }, []);

  useEffect(() => {
    filterIngredients();
  }, [ingredients, searchTerm, selectedCategory, viewMode]);

  const loadIngredients = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ingredientService.getAll();
      setIngredients(data);
    } catch (err) {
      console.error('Error cargando ingredientes:', err);
      setError('Error al cargar los ingredientes. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const filterIngredients = () => {
    let filtered = ingredients;

    filtered = filtered.filter(ing => 
      viewMode === 'active' ? ing.isActive !== false : ing.isActive === false
    );

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ing => ing.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(ing =>
        ing.name.toLowerCase().includes(search) ||
        ing.productId.toLowerCase().includes(search) ||
        ing.product.toLowerCase().includes(search) ||
        ing.brand.toLowerCase().includes(search)
      );
    }

    setFilteredIngredients(filtered);
    setCurrentPage(1); 
  };

  const handleCreateIngredient = async (formData) => {
    try {
      await ingredientService.create(formData);
      showToast('Ingrediente creado correctamente', 'success');
      await loadIngredients();
      return { success: true };
    } catch (err) {
      const fieldErrors = {};
      const msg = err?.message || 'Error al crear el ingrediente';
      if (/duplicate key|E11000|productId/i.test(msg)) {
        fieldErrors.productId = 'Este código ya existe';
      }
      return { success: false, fieldErrors, message: msg };
    }
  };

  const handleUpdateIngredient = async (formData) => {
    try {
      await ingredientService.update(formData.productId, formData);
      showToast('Ingrediente actualizado', 'success');
      await loadIngredients();
      return { success: true };
    } catch (err) {
      const fieldErrors = {};
      const msg = err?.message || 'Error al actualizar el ingrediente';
      if (/duplicate key|E11000|productId/i.test(msg)) {
        fieldErrors.productId = 'Este código ya existe';
      }
      return { success: false, fieldErrors, message: msg };
    }
  };

  const handleOpenModal = (ingredient = null) => {
    setEditingIngredient(ingredient);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIngredient(null);
  };

  const handleSubmitModal = async (formData) => {
    if (editingIngredient) {
      await handleUpdateIngredient(formData);
    } else {
      await handleCreateIngredient(formData);
    }
  };

  const showToast = (message, type = 'success') => {
    const t = { id: Date.now(), message, type };
    setToast(t);
  };

  const handleArchive = async (productId) => {
    setConfirm({ open: true, action: 'archive', payload: productId, loading: false });
  };

  const handleRestore = async (productId) => {
    setConfirm({ open: true, action: 'restore', payload: productId, loading: false });
  };

  const runConfirmedAction = async () => {
    const { action, payload } = confirm;
    setConfirm(prev => ({ ...prev, loading: true }));
    try {
      if (action === 'archive') {
        await ingredientService.delete(payload); // usa tu servicio
        showToast('Ingrediente archivado', 'success');
      } else if (action === 'restore') {
        await ingredientService.restore(payload);
        showToast('Ingrediente restaurado', 'success');
      }
      await loadIngredients(); // refrescar lista
    } catch (err) {
      showToast(err.message || 'Error en la operación', 'error');
    } finally {
      setConfirm({ open: false, action: null, payload: null, loading: false });
    }
  };

  // Calculate statistics
  const activeIngredients = ingredients.filter(ing => ing.isActive !== false);
  const totalValue = activeIngredients.reduce((sum, ing) => sum + (ing.price || 0), 0);
  const uniqueCategories = new Set(activeIngredients.map(ing => ing.category)).size;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredIngredients.slice(indexOfFirstItem, indexOfLastItem);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: '#9FB9B3' }}></div>
          <p className="text-gray-600">Cargando ingredientes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={loadIngredients}
            className="px-4 py-2 text-white rounded-md font-medium hover:opacity-90"
            style={{ backgroundColor: '#9FB9B3' }}
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full">
        <IngredientsStats
          totalProducts={activeIngredients.length}
          totalValue={totalValue}
          totalCategories={uniqueCategories}
        />

        <IngredientsFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenModal={() => handleOpenModal()}
          onOpenExportModal={() => setIsExportModalOpen(true)}
          categories={categories}
        />

        <IngredientsTable
          ingredients={currentItems}
          onEdit={handleOpenModal}
          onArchive={handleArchive}
          onRestore={handleRestore}
          viewMode={viewMode}
          currentPage={currentPage}
          totalItems={filteredIngredients.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />

        <IngredientsModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitModal}
          initialData={editingIngredient}
          categories={categories}
        />

        <ExportIngredientsModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          ingredients={ingredients.filter(ing => ing.isActive !== false)}
        />
      </div>

      <ConfirmationModal
        isOpen={confirm.open}
        title={confirm.action === 'archive' ? 'Archivar ingrediente' : 'Restaurar ingrediente'}
        message={confirm.action === 'archive' ? '¿Confirma archivar este ingrediente?' : '¿Confirma restaurar este ingrediente?'}
        onConfirm={runConfirmedAction}
        onCancel={() => setConfirm({ open: false, action: null, payload: null, loading: false })}
        loading={confirm.loading}
      />

      <Toast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </>
  );
};
export default Ingredients;