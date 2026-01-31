import { useEffect, useState } from 'react';
import recipeService from '../../services/recipe';
import RecipesFilters from './RecipesFilters';
import RecipesGrid from './RecipesGrid';
import RecipeModal from './RecipeModal';
import RecipeDetailModal from './RecipeDetailModal';
import Toast from '../../components/ui/Toast';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);

  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    let data = recipes;

    if (category) {
      data = data.filter(r => r.category === category);
    }

    if (search.trim()) {
      const s = search.toLowerCase();
      data = data.filter(r =>
        r.name.toLowerCase().includes(s)
      );
    }

    setFiltered(data);
  }, [recipes, search, category]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const data = await recipeService.getAll();
      setRecipes(data);
    } catch {
      showToast('Error al cargar recetas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (formData) => {
    try {
      if (editing) {
        await recipeService.update(editing._id, formData);
        showToast('Receta actualizada');
      } else {
        await recipeService.create(formData);
        showToast('Receta creada');
      }
      setModalOpen(false);
      setEditing(null);
      loadRecipes();
    } catch {
      showToast('Error al guardar receta', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
  };

  if (loading) {
    return <p className="text-center">Cargando recetas...</p>;
  }

  return (
    <>
      <RecipesFilters
        search={search}
        onSearch={setSearch}
        category={category}
        onCategory={setCategory}
        onNew={() => setModalOpen(true)}
      />

      <RecipesGrid
        recipes={filtered}
        onEdit={(r) => { setEditing(r); setModalOpen(true); }}
        onView={setDetail}
      />

      <RecipeModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSubmit={handleSave}
        initialData={editing}
      />

      <RecipeDetailModal
        recipe={detail}
        onClose={() => setDetail(null)}
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
};

export default Recipes;
