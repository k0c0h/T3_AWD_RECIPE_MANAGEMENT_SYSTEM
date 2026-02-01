import { useState, useEffect } from "react";
import Breadcrumbs from "../../components/ui/Breadcrumbs";
import recipeService from "../../services/recipe";
import costAnalysisService from "../../services/costAnalysis";
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
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, loading: false });

  const [margin, setMargin] = useState(30);
  const [ivaPercent, setIvaPercent] = useState(15);
  const [servicePercent, setServicePercent] = useState(10);

  const [ingredientsCostResult, setIngredientsCostResult] = useState(null);
  const [productCostResult, setProductCostResult] = useState(null);
  const [taxesResult, setTaxesResult] = useState(null);

  const [useDirectSave, setUseDirectSave] = useState(false);

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
    <div className="min-h-screen p-8 bg-[#f5f2eb]">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg border">
        <Breadcrumbs
          items={[
            { label: "Análisis de Costos", onClick: onBack },
            { label: "Nuevo Análisis" },
            { label: "Costo de ingredientes" },
          ]}
        />

        <div className="bg-white rounded-lg border p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Crear Análisis de Costos
          </h1>
          <p className="text-gray-600 mb-8">
            Selecciona una receta y verifica los ingredientes para crear un
            análisis
          </p>

          {!selectedRecipe ? (
            <>
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar receta..."
                className="w-full border p-3 rounded-md mt-4"
              />
              {showResults &&
                recipes.map((r) => (
                  <button
                    key={r._id}
                    onClick={() => handleSelectRecipe(r)}
                    className="block w-full text-left p-3 border-b hover:bg-gray-50"
                  >
                    {r.name}
                  </button>
                ))}
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold mt-4">
                {selectedRecipe.name}
              </h2>

              {/* STEP 1 */}
              {step === 1 && (
                <>
                  <h3 className="text-lg font-semibold mb-4">Ingredientes</h3>
                  {ingredients.map((i, idx) => (
                    <div key={idx} className="grid grid-cols-3 gap-3 mt-3">
                      <input
                        value={i.ingredientName}
                        readOnly
                        className="border p-2 rounded bg-gray-50"
                      />
                      <input
                        type="number"
                        value={i.selectedQuantity}
                        onChange={(e) => {
                          const copy = [...ingredients];
                          copy[idx].selectedQuantity = +e.target.value;
                          setIngredients(copy);
                        }}
                        className="border p-2 rounded"
                      />
                      <input
                        value={i.selectedUnit}
                        readOnly
                        className="border p-2 rounded bg-gray-50"
                      />
                    </div>
                  ))}

                  {/* Parámetros de cálculo */}
                  <div className="mt-6 space-y-4 p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-semibold">
                      Parámetros del Análisis
                    </h3>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Margen (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={margin}
                        onChange={(e) => setMargin(e.target.value)}
                        className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#adc4bc]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Porcentaje de IVA (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={ivaPercent}
                        onChange={(e) => setIvaPercent(e.target.value)}
                        className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#adc4bc]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Porcentaje de Servicio (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={servicePercent}
                        onChange={(e) => setServicePercent(e.target.value)}
                        className="w-full border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-[#adc4bc]"
                      />
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="mt-6 flex gap-4">
                    <button
                      onClick={() => {
                        setUseDirectSave(true);
                        setConfirm({ open: true, loading: false });
                      }}
                      className="flex-1 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-all font-medium"
                    >
                      ✓ Calcular y Guardar
                    </button>
                    <button
                      onClick={() => {
                        setUseDirectSave(false);
                        handleCalculateIngredients();
                      }}
                      className="flex-1 bg-[#adc4bc] text-white px-6 py-3 rounded-md hover:opacity-90 transition-all font-medium"
                    >
                      → Ver Cálculos Paso a Paso
                    </button>
                  </div>

                  <p className="text-sm text-gray-600 mt-3 text-center">
                    <strong>Recomendado:</strong> "Calcular y Guardar" crea el
                    análisis directamente. Usa "Ver Cálculos" solo si necesitas
                    revisar cada paso.
                  </p>
                </>
              )}

              {/* STEP 2 */}
              {step === 2 && (
                <>
                  <p>
                    Costo ingredientes: ${ingredientsCostResult.ingredientsCost}
                  </p>
                  <button
                    onClick={handleCalculateProduct}
                    className="mt-6 bg-[#adc4bc] text-white px-6 py-2 rounded-md"
                  >
                    Siguiente
                  </button>
                </>
              )}

              {/* STEP 3 */}
              {step === 3 && (
                <>
                  <div className="mt-4 p-4 bg-[#f5f2eb] rounded-lg">
                    <p className="text-lg font-semibold mb-4">
                      Precio por porción: $
                      {(
                        Number(productCostResult?.suggestedPricePerServing) || 0
                      ).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Margen aplicado: {margin}%
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      IVA configurado: {ivaPercent}%
                    </p>
                    <p className="text-sm text-gray-600">
                      Servicio configurado: {servicePercent}%
                    </p>
                  </div>

                  <button
                    onClick={handleCalculateTaxes}
                    className="mt-6 bg-[#adc4bc] text-white px-6 py-2 rounded-md hover:opacity-90"
                  >
                    Calcular Impuestos
                  </button>
                </>
              )}

              {/* STEP 4: IVA y Servicio */}
              {step === 4 && taxesResult?.taxes && (
                <>
                  <div className="mt-4 space-y-3">
                    <div className="p-4 bg-[#f5f2eb] rounded-lg">
                      <p className="text-gray-700">
                        <span className="font-semibold">
                          IVA ({taxesResult.taxes.ivaPercent}%):
                        </span>{" "}
                        ${(Number(taxesResult.taxes.ivaAmount) || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="p-4 bg-[#f5f2eb] rounded-lg">
                      <p className="text-gray-700">
                        <span className="font-semibold">
                          Servicio ({taxesResult.taxes.servicePercent}%):
                        </span>{" "}
                        $
                        {(Number(taxesResult.taxes.serviceAmount) || 0).toFixed(
                          2,
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(5)}
                    className="mt-6 bg-[#adc4bc] text-white px-6 py-2 rounded-md hover:opacity-90"
                  >
                    Ver total de impuestos
                  </button>
                </>
              )}

              {/* STEP 5: total impuestos + precio final */}
              {step === 5 && taxesResult && (
                <>
                  <p>
                    Total impuestos: $
                    {(Number(taxesResult.taxes.totalTaxes) || 0).toFixed(2)}
                  </p>
                  <p>
                    Precio final: $
                    {(Number(taxesResult.finalPrice) || 0).toFixed(2)}
                  </p>
                  <button
                    onClick={() => setConfirm({ open: true, loading: false })}
                    className="mt-6 bg-green-600 text-white px-6 py-2 rounded-md"
                  >
                    Guardar análisis
                  </button>
                </>
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
