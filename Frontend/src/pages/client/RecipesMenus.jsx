import { useEffect, useState } from "react";
import recipeService from "../../services/recipe";
import Recipe from "../../models/Recipes";
const API_BASE = import.meta.env.VITE_API_CRUD.replace("/dishdash", "");
const RecipesMenus = () => {
  const [recipes, setRecipes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [recipes, category, search]);

  const loadRecipes = async () => {
    try {
      const response = await recipeService.getAllRecipes();
      const mapped = Recipe.fromJSONArray(response.data);
      setRecipes(mapped);
    } catch (error) {
      console.error("Error al cargar recetas", error);
    }
  };

  const applyFilters = () => {
    let result = Recipe.filterByCategory(recipes, category);
    result = Recipe.filterBySearch(result, search);
    setFiltered(result);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-gray-800">
          Nuestro Menú Disponible
        </h2>
        <p className="text-gray-500 mt-2">
          Explora nuestras opciones gastronómicas y realiza tu cotización
          fácilmente
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-8">
        <input
          type="text"
          placeholder="Buscar recetas..."
          className="w-full md:w-1/3 px-4 py-2 border rounded-lg focus:outline-none focus:ring focus:ring-orange-300"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="flex gap-2 flex-wrap">
          {[
            { key: "all", label: "Todas" },
            { key: "cocktail", label: "Cócteles" },
            { key: "main", label: "Platos fuertes" },
            { key: "dessert", label: "Postres" },
            { key: "appetizer", label: "Aperitivos" },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setCategory(cat.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition
                ${
                  category === cat.key
                    ? "bg-orange-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="text-center text-gray-400 mt-16">
          No se encontraron recetas
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((recipe) => (
            <div
              key={recipe._id}
              className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
            >
              <img
                src={
                  recipe.image
                    ? `${API_BASE}${recipe.image}`
                    : "/placeholder.jpg"
                }
                alt={recipe.name}
                className="h-48 w-full object-cover"
              />
              <div className="p-5">
                <span className="text-xs uppercase tracking-wide text-orange-500 font-semibold">
                  {recipe.category}
                </span>

                <h3 className="text-lg font-bold text-gray-800 mt-1">
                  {recipe.name}
                </h3>

                <p className="text-sm text-gray-500 mt-2 line-clamp-3">
                  {recipe.description}
                </p>

                <button
                  disabled
                  className="mt-4 w-full py-2 text-sm rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed"
                >
                  Solicitar cotización
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipesMenus;
