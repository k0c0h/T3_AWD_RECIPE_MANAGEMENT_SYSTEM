import { useState, useEffect } from "react";
import { X, Search, Loader2 } from "lucide-react";
import recipeService from "../../services/recipe";
import ingredientService from "../../services/ingredient";
import costAnalysisService from "../../services/costAnalysis";

const CreateAnalysisModal = ({ isOpen, onClose, onSuccess }) => {
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  const [ingredients, setIngredients] = useState([]);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
  const [calculation, setCalculation] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Search recipes on input change
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchTerm.trim().length >= 2) {
        handleSearch();
      } else {
        setRecipes([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchTerm]);

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const response = await recipeService.getByName(searchTerm);
      const recipesData = Array.isArray(response) ? response : [response];
      setRecipes(recipesData);
      setShowResults(true);
    } catch (error) {
      console.error("Error searching recipes:", error);
      setRecipes([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectRecipe = async (recipe) => {
    setSelectedRecipe(recipe);
    setShowResults(false);
    setIsLoadingIngredients(true);

    try {
      const ingredientsWithOptions = await Promise.all(
        recipe.ingredients.map(async (recipeIngredient) => {
          try {
            const optionsResponse = await ingredientService.getByProduct(
              recipeIngredient.ingredientName
            );
            const options = Array.isArray(optionsResponse) 
              ? optionsResponse 
              : [optionsResponse];

            return {
              name: recipeIngredient.ingredientName,
              quantity: recipeIngredient.quantity || 0,
              unit: recipeIngredient.unit || "g",
              options: options,
              selectedOption: options[0] || null,
            };
          } catch (error) {
            console.error(`Error loading options for ${recipeIngredient.ingredientName}:`, error);
            return {
              name: recipeIngredient.ingredientName,
              quantity: recipeIngredient.quantity || 0,
              unit: recipeIngredient.unit || "g",
              options: [],
              selectedOption: null,
            };
          }
        })
      );

      setIngredients(ingredientsWithOptions);
      await calculateCost(ingredientsWithOptions);
    } catch (error) {
      console.error("Error loading ingredients:", error);
    } finally {
      setIsLoadingIngredients(false);
    }
  };

  const calculateCost = async (ingredientsList) => {
    const validIngredients = ingredientsList.filter(
      (ing) => ing.selectedOption && ing.quantity > 0
    );

    if (validIngredients.length === 0) {
      setCalculation(null);
      return;
    }

    setIsCalculating(true);
    try {
      const selectedIngredients = validIngredients.map((ing) => ({
        productId: ing.selectedOption.productId,
        quantity: parseFloat(ing.quantity),
        unit: ing.unit,
      }));

      const response = await costAnalysisService.calculateIngredientsCost(
        selectedIngredients
      );

      setCalculation(response);
    } catch (error) {
      console.error("Error calculating cost:", error);
      setCalculation(null);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleIngredientChange = (index, field, value) => {
    const updatedIngredients = [...ingredients];
    
    if (field === "selectedOption") {
      updatedIngredients[index].selectedOption = value;
    } else if (field === "quantity") {
      updatedIngredients[index].quantity = value;
    }
    
    setIngredients(updatedIngredients);
    calculateCost(updatedIngredients);
  };

  const handleClose = () => {
    setSelectedRecipe(null);
    setSearchTerm("");
    setRecipes([]);
    setIngredients([]);
    setCalculation(null);
    setShowResults(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#c8d0d2]">
          <h2 className="text-2xl font-semibold text-gray-800">
            Nuevo Análisis de Costos
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-[#f5f2eb] rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Search Recipe */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Buscar Receta:
            </label>
            <div className="relative">
              <div className="relative">
                <Search
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Escribe el nombre de la receta..."
                  className="w-full pl-12 pr-4 py-3 border-2 border-[#c8d0d2] rounded-xl focus:ring-2 focus:ring-[#adc4bc] focus:border-[#adc4bc] transition-all"
                  disabled={!!selectedRecipe}
                />
                {isSearching && (
                  <Loader2
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#adc4bc] animate-spin"
                    size={20}
                  />
                )}
              </div>

              {/* Search Results Dropdown */}
              {showResults && recipes.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-[#c8d0d2] rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {recipes.map((recipe) => (
                    <button
                      key={recipe._id}
                      onClick={() => handleSelectRecipe(recipe)}
                      className="w-full text-left px-5 py-4 hover:bg-[#f5f2eb] transition-colors border-b border-[#e7c78a] last:border-b-0"
                    >
                      <div className="font-medium text-gray-800">
                        {recipe.name}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {recipe.servings} porciones
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Recipe Display */}
            {selectedRecipe && (
              <div className="mt-4 p-4 bg-[#f5f2eb] border-2 border-[#e7c78a] rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-800">
                    {selectedRecipe.name}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {selectedRecipe.servings} porciones
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedRecipe(null);
                    setIngredients([]);
                    setCalculation(null);
                    setSearchTerm("");
                  }}
                  className="text-gray-500 hover:text-gray-700 text-sm px-4 py-2 bg-white rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cambiar receta
                </button>
              </div>
            )}
          </div>

          {/* Loading Ingredients */}
          {isLoadingIngredients && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-[#adc4bc]" size={40} />
              <span className="ml-3 text-gray-600">Cargando ingredientes...</span>
            </div>
          )}

          {/* Ingredients Table */}
          {!isLoadingIngredients && ingredients.length > 0 && (
            <div className="space-y-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-[#adc4bc]">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Ingrediente
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Quantity
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Unit Cost
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                        Total Cost
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ingredients.map((ingredient, index) => {
                      const line = calculation?.lines?.find(
                        (l) => l.productId === ingredient.selectedOption?.productId
                      );

                      return (
                        <tr
                          key={index}
                          className="border-b border-[#e7c78a] hover:bg-[#f5f2eb] transition-colors"
                        >
                          {/* Ingredient Name + Dropdown */}
                          <td className="py-4 px-4">
                            <div className="font-medium text-gray-800 mb-2">
                              {ingredient.name}
                            </div>
                            <select
                              value={ingredient.selectedOption?.productId || ""}
                              onChange={(e) => {
                                const selected = ingredient.options.find(
                                  (opt) => opt.productId === e.target.value
                                );
                                handleIngredientChange(index, "selectedOption", selected);
                              }}
                              className="w-full px-3 py-2 text-sm border-2 border-[#c8d0d2] rounded-lg focus:ring-2 focus:ring-[#adc4bc] focus:border-[#adc4bc] bg-white"
                            >
                              {ingredient.options.length === 0 ? (
                                <option value="">Sin opciones disponibles</option>
                              ) : (
                                ingredient.options.map((option) => (
                                  <option key={option.productId} value={option.productId}>
                                    {option.name} - ${option.price?.toFixed(2)}/{option.size}{option.sizeUnit} ({option.brand})
                                  </option>
                                ))
                              )}
                            </select>
                          </td>

                          {/* Quantity */}
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={ingredient.quantity}
                                onChange={(e) =>
                                  handleIngredientChange(index, "quantity", e.target.value)
                                }
                                className="w-24 px-3 py-2 border-2 border-[#c8d0d2] rounded-lg focus:ring-2 focus:ring-[#adc4bc] focus:border-[#adc4bc]"
                                min="0"
                                step="0.01"
                              />
                              <span className="text-sm text-gray-600">
                                {ingredient.unit}
                              </span>
                            </div>
                          </td>

                          {/* Unit Cost */}
                          <td className="py-4 px-4 text-gray-700">
                            {line ? `$${(Number(line?.unitCost) || 0).toFixed(4)}` : "-"}
                          </td>

                          {/* Total Cost */}
                          <td className="py-4 px-4 font-semibold text-gray-800">
                            {line ? `$${(Number(line?.totalCost) || 0).toFixed(2)}` : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Cost Summary */}
              {calculation && (
                <div className="mt-6 bg-[#f5f2eb] border-2 border-[#e7c78a] rounded-xl p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex justify-between items-center py-2 border-b border-[#edcab4]">
                      <span className="text-gray-700">Costo de Ingredientes:</span>
                      <span className="font-semibold text-gray-800">
                        ${(Number(calculation?.ingredientsCost) || 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#edcab4]">
                      <span className="text-gray-700">Costos Indirectos (25%):</span>
                      <span className="font-semibold text-gray-800">
                        ${(Number(calculation?.indirectCost) || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                  {isCalculating && (
                    <div className="flex items-center justify-center mt-4">
                      <Loader2 className="animate-spin text-[#adc4bc]" size={24} />
                      <span className="ml-2 text-sm text-gray-600">Calculando...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t-2 border-[#c8d0d2] px-8 py-6 bg-[#f5f2eb] flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-6 py-2.5 text-gray-700 bg-white border-2 border-[#c8d0d2] rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Cancelar
          </button>
          <button
            disabled={!calculation || isCalculating}
            className="px-6 py-2.5 bg-[#adc4bc] text-white rounded-lg hover:bg-[#9ab3ab] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateAnalysisModal;