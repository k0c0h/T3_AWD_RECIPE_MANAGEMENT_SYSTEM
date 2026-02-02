import { useState, useEffect } from "react";
import { Search, ArrowLeft, Calculator, Save, Eye } from "lucide-react";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import recipeService from "../../services/recipe";
import costAnalysisService from "../../services/costAnalysis";
import ingredientService from "../../services/ingredient";
import Toast from "../../components/ui/Toast";
import ConfirmationModal from "../../components/ui/ConfirmationModal";

const CreateAnalysisPage = ({ onBack, onSuccess }) => {
  const [step, setStep] = useState(1);

  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [ingredients, setIngredients] = useState([]);
  const [ingredientCosts, setIngredientCosts] = useState({});
  const [ingredientOptions, setIngredientOptions] = useState({}); // Opciones disponibles por ingrediente
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, loading: false });

  const [margin, setMargin] = useState(30);
  const [ivaPercent, setIvaPercent] = useState(15);
  const [servicePercent, setServicePercent] = useState(10);

  const [ingredientsCostResult, setIngredientsCostResult] = useState(null);
  const [productCostResult, setProductCostResult] = useState(null);
  const [taxesResult, setTaxesResult] = useState(null);

  const [useDirectSave, setUseDirectSave] = useState(false);
  const [loadingCosts, setLoadingCosts] = useState(false);

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchTerm.trim().length >= 2) handleSearch();
      else {
        setRecipes([]);
        setShowResults(false);
      }
    }, 500);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  // Cargar costos de ingredientes cuando se selecciona una receta
  useEffect(() => {
    if (ingredients.length > 0) {
      loadIngredientCosts();
      loadIngredientOptions();
    }
  }, [ingredients]);

  const loadIngredientOptions = async () => {
    try {
      const options = {};
      for (const ing of ingredients) {
        if (ing.ingredientName) {
          try {
            const response = await ingredientService.getByName(ing.ingredientName);
            const items = Array.isArray(response) ? response : (response.data || []);
            
            // Filtrar solo ingredientes activos
            const activeItems = items.filter(item => item.isActive !== false);
            
            if (activeItems.length > 0) {
              options[ing.ingredientName] = activeItems.map(item => ({
                productId: item.productId,
                name: item.name,
                product: item.product,
                brand: item.brand,
                price: item.price,
                size: item.size,
                sizeUnit: item.sizeUnit,
              }));
            }
          } catch (error) {
            console.error(`Error loading options for ${ing.ingredientName}:`, error);
          }
        }
      }
      setIngredientOptions(options);
    } catch (error) {
      console.error("Error loading ingredient options:", error);
    }
  };

  const loadIngredientCosts = async () => {
    setLoadingCosts(true);
    try {
      const costs = {};
      for (const ing of ingredients) {
        if (ing.productId) {
          try {
            const response = await ingredientService.getByProductId(ing.productId);
            const ingredient = response.data || response;
            
            // El campo en BD es 'price', no 'unitCost'
            if (ingredient && ingredient.price) {
              costs[ing.productId] = {
                unitCost: Number(ingredient.price),
                unit: ingredient.sizeUnit || ing.selectedUnit,
                size: ingredient.size || 1,
                productName: ingredient.product || ingredient.name,
              };
            }
          } catch (error) {
            console.error(`Error loading cost for ${ing.ingredientName}:`, error);
          }
        }
      }
      setIngredientCosts(costs);
    } catch (error) {
      console.error("Error loading ingredient costs:", error);
    } finally {
      setLoadingCosts(false);
    }
  };

  const handleProductChange = async (index, newProductId) => {
    const copy = [...ingredients];
    copy[index].productId = newProductId;
    setIngredients(copy);

    // Cargar el costo del nuevo producto seleccionado
    try {
      const response = await ingredientService.getByProductId(newProductId);
      const ingredient = response.data || response;
      
      if (ingredient && ingredient.price) {
        setIngredientCosts(prev => ({
          ...prev,
          [newProductId]: {
            unitCost: Number(ingredient.price),
            unit: ingredient.sizeUnit || copy[index].selectedUnit,
            size: ingredient.size || 1,
            productName: ingredient.product || ingredient.name,
          }
        }));
      }
    } catch (error) {
      console.error(`Error loading cost for new product:`, error);
    }
  };

  const calculateIngredientTotal = (ing) => {
    const costInfo = ingredientCosts[ing.productId];
    if (!costInfo || !costInfo.unitCost) return 0;
    
    // costInfo.unitCost es el precio total del producto
    // costInfo.size es el tamaño (ej: 750ml)
    // Calculamos el precio por unidad base
    const pricePerUnit = costInfo.unitCost / (costInfo.size || 1);
    
    return Number(ing.selectedQuantity || 0) * pricePerUnit;
  };

  const calculateTotalCost = () => {
    return ingredients.reduce((sum, ing) => sum + calculateIngredientTotal(ing), 0);
  };

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const response = await recipeService.getByName(searchTerm);
      setRecipes(Array.isArray(response) ? response : [response]);
      setShowResults(true);
    } catch {
      showToast("Error al buscar recetas", "error");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectRecipe = (recipe) => {
    setSelectedRecipe(recipe);
    setShowResults(false);
    setIngredients(
      recipe.ingredients.map((ing) => ({
        ingredientName: ing.ingredientName,
        productId: ing.productId,
        selectedQuantity: ing.quantity,
        selectedUnit: ing.unit,
      })),
    );
    setStep(1);
    setIngredientsCostResult(null);
    setProductCostResult(null);
    setTaxesResult(null);
  };

  const handleCalculateIngredients = async () => {
    try {
      const response = await costAnalysisService.calculateIngredientsCost(
        ingredients.map((i) => ({
          ingredientName: i.ingredientName,
          productId: i.productId,
          quantity: i.selectedQuantity,
          unit: i.selectedUnit,
        })),
      );
      setIngredientsCostResult(response);
      setStep(2);
    } catch {
      showToast("Error al calcular ingredientes", "error");
    }
  };

  const handleCalculateProduct = async () => {
    try {
      const response = await costAnalysisService.calculateProductCost({
        ingredientsCost: Number(ingredientsCostResult?.ingredientsCost) || 0,
        indirectCost: Number(ingredientsCostResult?.indirectCost) || 0,
        servings: Number(selectedRecipe?.servings) || 1,
        margin: Number(margin),
      });
      setProductCostResult(response);
      setStep(3);
    } catch (error) {
      console.error(error);
      showToast("Error al calcular costo del producto", "error");
    }
  };

  const handleCalculateTaxes = async () => {
    const price = Number(productCostResult?.suggestedPricePerServing);
    if (!price || isNaN(price) || price <= 0) {
      showToast("El precio por porción no es válido", "error");
      return;
    }

    if (ivaPercent < 0 || ivaPercent > 100) {
      showToast("El porcentaje de IVA debe estar entre 0 y 100", "error");
      return;
    }
    if (servicePercent < 0 || servicePercent > 100) {
      showToast("El porcentaje de servicio debe estar entre 0 y 100", "error");
      return;
    }

    try {
      const response = await costAnalysisService.calculateTaxes({
        suggestedPricePerServing: price,
        ivaPercent: Number(ivaPercent),
        servicePercent: Number(servicePercent),
      });

      setTaxesResult(response);
      setStep(4);
    } catch (error) {
      console.error(error);
      showToast("Error al calcular impuestos", "error");
    }
  };

  const confirmCreate = async () => {
    setConfirm({ open: true, loading: true });

    try {
      if (useDirectSave) {
        const payload = {
          recipeId: selectedRecipe._id,
          selectedIngredients: ingredients.map((i) => ({
            ingredientName: i.ingredientName,
            productId: i.productId,
            quantity: i.selectedQuantity,
            unit: i.selectedUnit,
          })),
          margin: Number(margin),
          ivaPercent: Number(ivaPercent),
          servicePercent: Number(servicePercent),
        };

        let result = null;
        try {
          result = await costAnalysisService.calculateCompleteCostAnalysis(payload);
        } catch (calcErr) {
          console.error('Error calculando completo en backend:', calcErr);
          const shouldFallback = !calcErr || calcErr.status === 404 || (calcErr.message && calcErr.message.toLowerCase().includes('not found')) || (calcErr.message && calcErr.message.toLowerCase().includes('no response'));

          if (shouldFallback) {
            showToast('Cálculo completo no accesible, intentando cálculo paso a paso (fallback)', 'warning');
            try {
              const ingredientsResult = await costAnalysisService.calculateIngredientsCost(payload.selectedIngredients);

              const productResult = await costAnalysisService.calculateProductCost({
                ingredientsCost: Number(ingredientsResult.ingredientsCost) || 0,
                indirectCost: Number(ingredientsResult.indirectCost) || 0,
                servings: Number(selectedRecipe?.servings) || 1,
                margin: Number(margin),
              });

              const taxesResult = await costAnalysisService.calculateTaxes({
                suggestedPricePerServing: Number(productResult.suggestedPricePerServing) || 0,
                ivaPercent: Number(ivaPercent),
                servicePercent: Number(servicePercent),
              });

              result = {
                recipeId: payload.recipeId,
                recipeName: selectedRecipe?.name || '',
                servings: Number(selectedRecipe?.servings) || 1,
                lines: ingredientsResult.lines || [],
                ingredientsCost: ingredientsResult.ingredientsCost || 0,
                indirectCost: ingredientsResult.indirectCost || 0,
                totalCost: productResult.totalCost || 0,
                costPerServing: productResult.costPerServing || 0,
                suggestedPricePerServing: productResult.suggestedPricePerServing || 0,
                margin: productResult.margin || margin,
                taxes: taxesResult.taxes || null,
                finalPrice: taxesResult.finalPrice || null,
              };
            } catch (fallbackErr) {
              console.error('Fallback paso a paso falló:', fallbackErr);
              showToast('No fue posible calcular análisis (fallback falló)', 'error');
              setConfirm({ open: false, loading: false });
              return;
            }
          } else {
            showToast(calcErr && calcErr.message ? calcErr.message : 'Error calculando análisis', 'error');
            setConfirm({ open: false, loading: false });
            return;
          }
        }

        const createPayload = {
          recipeId: result.recipeId,
          recipeName: result.recipeName,
          servings: Number(result.servings) || Number(selectedRecipe?.servings) || 1,

          suggestedPricePerServing: Number(result.suggestedPricePerServing) || 0,
          costPerServing: Number(result.costPerServing) || 0,
          totalCost: Number(result.totalCost) || 0,
          indirectCost: Number(result.indirectCost) || 0,
          ingredientsCost: Number(result.ingredientsCost) || 0,

          selectedIngredients: Array.isArray(result.lines)
            ? result.lines.map((l) => ({
                ingredientName: l.name,
                productId: l.productId,
                quantity: l.quantity,
                unit: l.unit,
                unitCost: l.unitCost,
                totalCost: l.totalCost,
              }))
            : [],

          margin: Number(result.margin) || Number(margin) || 0,
          ivaPercent: Number(ivaPercent),
          servicePercent: Number(servicePercent),

          taxes: result.taxes || null,
          finalPrice: result.finalPrice || null,
        };

        try {
          const created = await costAnalysisService.create(createPayload);
          showToast("Análisis creado correctamente (directo)", "success");
          onSuccess(created);
        } catch (createErr) {
          console.error('Error guardando análisis directo:', createErr);
          showToast('Análisis calculado pero error al guardar en servidor', 'error');
        }
      } else {
        if (!taxesResult) {
          showToast("Completa todos los pasos antes de guardar", "error");
          setConfirm({ open: false, loading: false });
          return;
        }

        const payload = {
          recipeId: selectedRecipe._id,
          recipeName: selectedRecipe.name,
          servings: Number(selectedRecipe.servings) || 1,

          suggestedPricePerServing:
            Number(productCostResult?.suggestedPricePerServing) || 0,
          costPerServing: Number(productCostResult?.costPerServing) || 0,
          totalCost:
            Number(ingredientsCostResult?.ingredientsCost || 0) +
            Number(ingredientsCostResult?.indirectCost || 0),
          indirectCost: Number(ingredientsCostResult?.indirectCost) || 0,
          ingredientsCost: Number(ingredientsCostResult?.ingredientsCost) || 0,

          selectedIngredients: ingredients.map((i) => ({
            ingredientName: i.ingredientName,
            productId: i.productId,
            quantity: i.selectedQuantity,
            unit: i.selectedUnit,
          })),

          margin: Number(margin),
          ivaPercent: Number(ivaPercent),
          servicePercent: Number(servicePercent),

          taxes: taxesResult?.taxes || null,
          finalPrice: taxesResult?.finalPrice || null,
        };

        await costAnalysisService.create(payload);

        showToast("Análisis creado correctamente", "success");
        onSuccess();
      }
    } catch (error) {
      console.error("Error al guardar análisis:", error);
      showToast("Error al guardar análisis", "error");
      setConfirm({ open: false, loading: false });
    }
  };

  const showToast = (message, type = "success") =>
    setToast({ id: Date.now(), message, type });

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-6 lg:p-8 bg-[#f5f2eb]">
      <div className="max-w-5xl mx-auto">
        {/* Header con botón volver */}
        <div className="mb-4 sm:mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-sm sm:text-base">Volver a Análisis</span>
          </button>

          <Breadcrumbs
            items={[
              { label: "Análisis de Costos", onClick: onBack },
              { label: "Nuevo Análisis" },
            ]}
          />
        </div>

        <div className="bg-white rounded-lg border p-4 sm:p-6 lg:p-8">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
              Crear Análisis de Costos
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Selecciona una receta y verifica los ingredientes para crear un análisis
            </p>
          </div>

          {!selectedRecipe ? (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar receta por nombre..."
                  className="w-full pl-9 sm:pl-10 pr-4 py-2.5 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#adc4bc]"
                />
              </div>

              {isSearching && (
                <div className="text-center py-4 text-gray-500 text-sm sm:text-base">
                  Buscando...
                </div>
              )}

              {showResults && recipes.length > 0 && (
                <div className="border rounded-lg overflow-hidden divide-y">
                  {recipes.map((r) => (
                    <button
                      key={r._id}
                      onClick={() => handleSelectRecipe(r)}
                      className="block w-full text-left p-3 sm:p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900 text-sm sm:text-base">
                        {r.name}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-500 mt-1">
                        {r.servings} porciones • {r.ingredients?.length || 0} ingredientes
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {showResults && recipes.length === 0 && !isSearching && (
                <div className="text-center py-8 text-gray-500 text-sm sm:text-base">
                  No se encontraron recetas
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="mb-6 p-3 sm:p-4 bg-[#f5f2eb] rounded-lg">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {selectedRecipe.name}
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 mt-1">
                  {selectedRecipe.servings} porciones
                </p>
              </div>

              {/* STEP 1: Ingredientes y Parámetros */}
              {step === 1 && (
                <div className="space-y-6">
                  {/* Tabla de ingredientes */}
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold mb-4 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-[#adc4bc]" />
                      Ingredientes y Costos
                    </h3>

                    {loadingCosts && (
                      <div className="text-center py-4 text-sm text-gray-500">
                        Cargando costos...
                      </div>
                    )}

                    {/* Desktop Table */}
                    <div className="hidden lg:block overflow-x-auto border rounded-lg">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                              Ingrediente
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                              Producto
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                              Cantidad
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">
                              Unidad
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                              Costo Unit.
                            </th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                              Costo Total
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {ingredients.map((ing, idx) => {
                            const costInfo = ingredientCosts[ing.productId];
                            const pricePerUnit = costInfo?.unitCost && costInfo?.size 
                              ? costInfo.unitCost / costInfo.size 
                              : 0;
                            const totalCost = calculateIngredientTotal(ing);
                            const options = ingredientOptions[ing.ingredientName] || [];

                            return (
                              <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                  {ing.ingredientName}
                                </td>
                                <td className="px-4 py-3">
                                  {options.length > 1 ? (
                                    <select
                                      value={ing.productId}
                                      onChange={(e) => handleProductChange(idx, e.target.value)}
                                      className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#adc4bc]"
                                    >
                                      {options.map((opt) => (
                                        <option key={opt.productId} value={opt.productId}>
                                          {opt.brand} - {opt.product} ({opt.size}{opt.sizeUnit}) - ${opt.price?.toFixed(2)}
                                        </option>
                                      ))}
                                    </select>
                                  ) : (
                                    <div className="text-sm text-gray-700">
                                      {costInfo?.productName || 'Sin opciones'}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={ing.selectedQuantity}
                                    onChange={(e) => {
                                      const copy = [...ingredients];
                                      copy[idx].selectedQuantity = +e.target.value;
                                      setIngredients(copy);
                                    }}
                                    className="w-full border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-[#adc4bc]"
                                  />
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-700">
                                  {ing.selectedUnit}
                                </td>
                                <td className="px-4 py-3 text-sm text-right text-gray-700">
                                  ${pricePerUnit.toFixed(4)}
                                </td>
                                <td className="px-4 py-3 text-sm text-right font-semibold text-gray-900">
                                  ${totalCost.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}
                          <tr className="bg-gray-50 font-semibold">
                            <td colSpan="5" className="px-4 py-3 text-right text-sm">
                              Total Estimado:
                            </td>
                            <td className="px-4 py-3 text-right text-base text-[#adc4bc]">
                              ${calculateTotalCost().toFixed(2)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Cards */}
                    <div className="lg:hidden space-y-3">
                      {ingredients.map((ing, idx) => {
                        const costInfo = ingredientCosts[ing.productId];
                        const pricePerUnit = costInfo?.unitCost && costInfo?.size 
                          ? costInfo.unitCost / costInfo.size 
                          : 0;
                        const totalCost = calculateIngredientTotal(ing);
                        const options = ingredientOptions[ing.ingredientName] || [];

                        return (
                          <div key={idx} className="border rounded-lg p-3 sm:p-4 space-y-3">
                            <div className="font-medium text-gray-900 text-sm sm:text-base">
                              {ing.ingredientName}
                            </div>

                            {/* Selector de producto */}
                            {options.length > 1 && (
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  Producto / Marca
                                </label>
                                <select
                                  value={ing.productId}
                                  onChange={(e) => handleProductChange(idx, e.target.value)}
                                  className="w-full border border-gray-300 px-3 py-2 rounded-md text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-[#adc4bc]"
                                >
                                  {options.map((opt) => (
                                    <option key={opt.productId} value={opt.productId}>
                                      {opt.brand} - {opt.product} ({opt.size}{opt.sizeUnit}) - ${opt.price?.toFixed(2)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}

                            {options.length === 1 && (
                              <div className="text-xs sm:text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
                                {costInfo?.productName || 'Producto único'}
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  Cantidad
                                </label>
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={ing.selectedQuantity}
                                  onChange={(e) => {
                                    const copy = [...ingredients];
                                    copy[idx].selectedQuantity = +e.target.value;
                                    setIngredients(copy);
                                  }}
                                  className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#adc4bc]"
                                />
                              </div>

                              <div>
                                <label className="block text-xs text-gray-600 mb-1">
                                  Unidad
                                </label>
                                <div className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700 border border-gray-200">
                                  {ing.selectedUnit}
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                              <div>
                                <div className="text-xs text-gray-600">Costo Unitario</div>
                                <div className="text-sm font-medium text-gray-900 mt-1">
                                  ${pricePerUnit.toFixed(4)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-xs text-gray-600">Costo Total</div>
                                <div className="text-sm font-semibold text-[#adc4bc] mt-1">
                                  ${totalCost.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      {/* Total móvil */}
                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border-2 border-[#adc4bc]">
                        <div className="flex justify-between items-center">
                          <span className="text-sm sm:text-base font-semibold text-gray-700">
                            Total Estimado:
                          </span>
                          <span className="text-lg sm:text-xl font-bold text-[#adc4bc]">
                            ${calculateTotalCost().toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Parámetros de cálculo */}
                  <div className="space-y-4 p-4 sm:p-6 bg-gray-50 rounded-lg border">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                      Parámetros del Análisis
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          Margen (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={margin}
                          onChange={(e) => setMargin(e.target.value)}
                          className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#adc4bc]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          IVA (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={ivaPercent}
                          onChange={(e) => setIvaPercent(e.target.value)}
                          className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#adc4bc]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                          Servicio (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.1"
                          value={servicePercent}
                          onChange={(e) => setServicePercent(e.target.value)}
                          className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-[#adc4bc]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setUseDirectSave(true);
                          setConfirm({ open: true, loading: false });
                        }}
                        className="flex items-center justify-center gap-2 bg-green-600 text-white px-4 sm:px-6 py-3 rounded-md hover:bg-green-700 transition-all font-medium text-sm sm:text-base"
                      >
                        <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                        Calcular y Guardar
                      </button>
                      <button
                        onClick={() => {
                          setUseDirectSave(false);
                          handleCalculateIngredients();
                        }}
                        className="flex items-center justify-center gap-2 bg-[#adc4bc] text-white px-4 sm:px-6 py-3 rounded-md hover:opacity-90 transition-all font-medium text-sm sm:text-base"
                      >
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                        Ver Paso a Paso
                      </button>
                    </div>

                    <p className="text-xs sm:text-sm text-gray-600 text-center px-4">
                      <strong>Recomendado:</strong> "Calcular y Guardar" crea el
                      análisis directamente. Usa "Ver Paso a Paso" solo si necesitas
                      revisar cada cálculo.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <div className="space-y-4">
                  <div className="p-4 sm:p-6 bg-[#f5f2eb] rounded-lg">
                    <div className="text-sm text-gray-600 mb-2">Costo de Ingredientes</div>
                    <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                      ${(Number(ingredientsCostResult?.ingredientsCost) || 0).toFixed(2)}
                    </div>
                  </div>
                  <button
                    onClick={handleCalculateProduct}
                    className="w-full bg-[#adc4bc] text-white px-6 py-3 rounded-md hover:opacity-90 transition-all font-medium"
                  >
                    Siguiente: Calcular Precio
                  </button>
                </div>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <div className="space-y-4">
                  <div className="p-4 sm:p-6 bg-[#f5f2eb] rounded-lg space-y-3">
                    <div>
                      <div className="text-sm text-gray-600">Precio por Porción</div>
                      <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                        ${(Number(productCostResult?.suggestedPricePerServing) || 0).toFixed(2)}
                      </div>
                    </div>
                    <div className="pt-3 border-t space-y-1">
                      <p className="text-xs sm:text-sm text-gray-600">
                        Margen aplicado: <span className="font-semibold">{margin}%</span>
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        IVA configurado: <span className="font-semibold">{ivaPercent}%</span>
                      </p>
                      <p className="text-xs sm:text-sm text-gray-600">
                        Servicio configurado: <span className="font-semibold">{servicePercent}%</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleCalculateTaxes}
                    className="w-full bg-[#adc4bc] text-white px-6 py-3 rounded-md hover:opacity-90 transition-all font-medium"
                  >
                    Calcular Impuestos
                  </button>
                </div>
              )}

              {/* STEP 4: Impuestos */}
              {step === 4 && taxesResult?.taxes && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 sm:p-6 bg-[#f5f2eb] rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm sm:text-base text-gray-700">
                          IVA ({taxesResult.taxes.ivaPercent}%)
                        </span>
                        <span className="text-base sm:text-lg font-semibold text-gray-900">
                          ${(Number(taxesResult.taxes.ivaAmount) || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 sm:p-6 bg-[#f5f2eb] rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-sm sm:text-base text-gray-700">
                          Servicio ({taxesResult.taxes.servicePercent}%)
                        </span>
                        <span className="text-base sm:text-lg font-semibold text-gray-900">
                          ${(Number(taxesResult.taxes.serviceAmount) || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(5)}
                    className="w-full bg-[#adc4bc] text-white px-6 py-3 rounded-md hover:opacity-90 transition-all font-medium"
                  >
                    Ver Total Final
                  </button>
                </div>
              )}

              {/* STEP 5: Total final */}
              {step === 5 && taxesResult && (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="p-4 sm:p-6 bg-gray-50 rounded-lg border">
                      <div className="flex justify-between items-center">
                        <span className="text-sm sm:text-base text-gray-700">
                          Total Impuestos
                        </span>
                        <span className="text-base sm:text-lg font-semibold text-gray-900">
                          ${(Number(taxesResult.taxes.totalTaxes) || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <div className="p-4 sm:p-6 bg-green-50 rounded-lg border-2 border-green-500">
                      <div className="flex justify-between items-center">
                        <span className="text-base sm:text-lg font-semibold text-gray-700">
                          Precio Final
                        </span>
                        <span className="text-2xl sm:text-3xl font-bold text-green-600">
                          ${(Number(taxesResult.finalPrice) || 0).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setConfirm({ open: true, loading: false })}
                    className="w-full bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-all font-medium flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    Guardar Análisis
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <ConfirmationModal
          isOpen={confirm.open}
          title="Guardar análisis"
          message="¿Deseas guardar este análisis de costos?"
          confirmText="Guardar"
          onConfirm={confirmCreate}
          onCancel={() => setConfirm({ open: false, loading: false })}
          loading={confirm.loading}
        />

        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    </div>
  );
};

export default CreateAnalysisPage;