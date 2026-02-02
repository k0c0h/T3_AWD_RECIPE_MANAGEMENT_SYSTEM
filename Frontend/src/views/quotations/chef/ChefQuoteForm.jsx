import { useEffect, useMemo, useState } from "react";
import SearchableSelect from "../../../components/ui/SearchableSelect";
import Toast from "../../../components/ui/Toast";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import Input from "../../../components/ui/Input";
import Select from "../../../components/ui/Select";
import recipeService from "../../../services/recipe";
import quotationService from "../../../services/quotation";
import { useAuth } from "../../../context/AuthContext";

const EVENT_TYPES = [
  { value: "wedding", label: "Boda" },
  { value: "corporate_event", label: "Evento corporativo" },
  { value: "birthday_party", label: "Cumpleaños" },
  { value: "other", label: "Otro" },
];

const formatCurrency = (value, currency = "$") => {
  const numberValue = Number(value || 0);
  return `${currency}${numberValue.toFixed(2)}`;
};

const FormField = ({ label, description, children }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    {description && (
      <p className="text-xs text-gray-500 mb-2">{description}</p>
    )}
    {children}
  </div>
);

const buildRecipeSelection = (recipe) => ({
  recipeId: recipe._id,
  recipeName: recipe.name,
  servings: recipe.servings || 1,
  selectedIngredients: Array.isArray(recipe.ingredients)
    ? recipe.ingredients.map((ing) => ({
        productId: ing.productId || ing._id || "",
        name: ing.ingredientName || ing.name || "",
        ingredientName: ing.ingredientName || ing.name || "",
        quantity: Number(ing.quantity) || 0,
        unit: ing.unit || "",
      }))
    : [],
  expanded: false,
});

const ChefQuoteForm = ({ onShowHistory, onSaved }) => {
  const { user } = useAuth();

  const [recipes, setRecipes] = useState([]);
  const [selectedRecipeOption, setSelectedRecipeOption] = useState(null);
  const [selectedRecipes, setSelectedRecipes] = useState([]);

  const [clientInfo, setClientInfo] = useState({
    name: "",
    phone: "",
    email: "",
  });

  const [eventInfo, setEventInfo] = useState({
    eventType: "wedding",
    numberOfGuests: 0,
    eventDate: "",
    eventTime: "",
    location: {
      address: "",
      venueName: "",
    },
    specialRequirements: "",
    dietaryRestrictions: "",
    preferredCuisine: "",
    additionalNotes: "",
  });

  const [discountType, setDiscountType] = useState("percentage");
  const [discountValue, setDiscountValue] = useState(0);
  const [ivaPercent, setIvaPercent] = useState(0);
  const [servicePercent, setServicePercent] = useState(0);
  const [otherPercent, setOtherPercent] = useState(0);

  const [calculation, setCalculation] = useState(null);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState({
    open: false,
    action: null,
    loading: false,
    title: "",
    message: "",
    confirmText: "Aceptar",
  });

  const minEventDate = (() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  })();

  useEffect(() => {
    const loadRecipes = async () => {
      setIsLoadingRecipes(true);
      try {
        const data = await recipeService.getAll();
        setRecipes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error loading recipes:", error);
        showToast("No se pudieron cargar las recetas", "error");
      } finally {
        setIsLoadingRecipes(false);
      }
    };

    loadRecipes();
  }, []);

  const availableRecipes = useMemo(
    () => recipes.filter((r) => !selectedRecipes.some((s) => s.recipeId === r._id)),
    [recipes, selectedRecipes]
  );

  const showToast = (message, type = "success") => {
    setToast({ id: Date.now(), message, type });
  };

  const openConfirm = ({ action, title, message, confirmText }) => {
    setConfirm({
      open: true,
      action,
      loading: false,
      title,
      message,
      confirmText,
    });
  };

  const handleRecipeSelect = (recipe) => {
    setSelectedRecipeOption(recipe);
    if (!recipe) return;

    if (selectedRecipes.some((r) => r.recipeId === recipe._id)) {
      showToast("La receta ya fue agregada", "warn");
      setSelectedRecipeOption(null);
      return;
    }

    setSelectedRecipes((prev) => [...prev, buildRecipeSelection(recipe)]);
    setSelectedRecipeOption(null);
  };

  const handleRemoveRecipe = (recipeId) => {
    setSelectedRecipes((prev) => prev.filter((r) => r.recipeId !== recipeId));
  };

  const handleToggleRecipe = (recipeId) => {
    setSelectedRecipes((prev) =>
      prev.map((r) =>
        r.recipeId === recipeId ? { ...r, expanded: !r.expanded } : r
      )
    );
  };

  const handleRecipeServingsChange = (recipeId, value) => {
    const numberValue = Number(value);
    if (Number.isNaN(numberValue) || numberValue <= 0) return;

    setSelectedRecipes((prev) =>
      prev.map((r) =>
        r.recipeId === recipeId ? { ...r, servings: numberValue } : r
      )
    );
  };

  const handleIngredientChange = (recipeId, index, field, value) => {
    setSelectedRecipes((prev) =>
      prev.map((recipe) => {
        if (recipe.recipeId !== recipeId) return recipe;
        const ingredients = [...recipe.selectedIngredients];
        const updatedValue = field === "quantity" ? Number(value) : value;
        ingredients[index] = {
          ...ingredients[index],
          [field]: updatedValue,
        };
        return { ...recipe, selectedIngredients: ingredients };
      })
    );
  };

  const validateForCalculation = () => {
    if (selectedRecipes.length === 0) {
      showToast("Debes agregar al menos una receta", "error");
      return false;
    }

    const invalid = selectedRecipes.some((recipe) =>
      recipe.selectedIngredients.some(
        (ing) => !ing.productId || !ing.unit || Number(ing.quantity) <= 0
      )
    );

    if (invalid) {
      showToast("Revisa ingredientes, cantidades y unidades", "error");
      return false;
    }

    return true;
  };

  const handleCalculate = async () => {
    if (!validateForCalculation()) return;

    setIsCalculating(true);
    try {
      const payload = {
        recipes: selectedRecipes.map((recipe) => ({
          recipeId: recipe.recipeId,
          servings: Number(recipe.servings) || 1,
          selectedIngredients: recipe.selectedIngredients.map((ing) => ({
            productId: ing.productId,
            name: ing.name,
            ingredientName: ing.ingredientName || ing.name,
            quantity: Number(ing.quantity) || 0,
            unit: ing.unit,
          })),
        })),
        discountType,
        discountValue: Number(discountValue) || 0,
        ivaPercent: Number(ivaPercent) || 0,
        servicePercent: Number(servicePercent) || 0,
        otherPercent: Number(otherPercent) || 0,
      };

      const result = await quotationService.calculateChefQuotation(payload);
      setCalculation(result);
      showToast("Cotización calculada", "success");
    } catch (error) {
      console.error("Error calculating quotation:", error);
      showToast(error?.message || "Error al calcular cotización", "error");
    } finally {
      setIsCalculating(false);
    }
  };

  const validateForSave = () => {
    if (!clientInfo.name || !clientInfo.email || !clientInfo.phone) {
      showToast("Completa los datos del cliente", "error");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(clientInfo.email)) {
      showToast("Ingresa un email válido", "error");
      return false;
    }
    if (Number(eventInfo.numberOfGuests) <= 0) {
      showToast("Ingresa el número de invitados", "error");
      return false;
    }
    if (!eventInfo.eventDate || !eventInfo.eventTime) {
      showToast("Completa fecha y hora del evento", "error");
      return false;
    }

    // Asegurar que la fecha no sea anterior a hoy
    if (eventInfo.eventDate && eventInfo.eventDate < minEventDate) {
      showToast('La fecha del evento debe ser desde hoy en adelante', 'error');
      return false;
    }
    if (!calculation) {
      showToast("Primero calcula la cotización", "error");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForSave()) return;

    setIsSaving(true);
    try {
      const payload = {
        quotationType: "chef_quotation",
        status: "pending",
        clientInfo,
        eventInfo: {
          ...eventInfo,
          numberOfGuests: Number(eventInfo.numberOfGuests) || 0,
        },
        recipes: calculation.recipes || [],
        discount: calculation.discount || {
          type: discountType,
          value: Number(discountValue) || 0,
        },
        subtotal: Number(calculation.subtotal) || 0,
        discountAmount: Number(calculation.discountAmount) || 0,
        taxes: calculation.taxes || {},
        totalAmount: Number(calculation.totalAmount) || 0,
        chefId: user?._id || user?.id || undefined,
      };

      await quotationService.createChefQuotation(payload);
      showToast("Cotización guardada", "success");
      if (onSaved) onSaved();
    } catch (error) {
      console.error("Error saving quotation:", error);
      showToast(error?.message || "Error al guardar la cotización", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = () => {
    setSelectedRecipes([]);
    setCalculation(null);
    setClientInfo({ name: "", phone: "", email: "" });
    setEventInfo({
      eventType: "wedding",
      numberOfGuests: 0,
      eventDate: "",
      eventTime: "",
      location: { address: "", venueName: "" },
      specialRequirements: "",
      dietaryRestrictions: "",
      preferredCuisine: "",
      additionalNotes: "",
    });
    setDiscountType("percentage");
    setDiscountValue(0);
    setIvaPercent(0);
    setServicePercent(0);
    setOtherPercent(0);
  };

  const handleConfirmAction = async () => {
    if (confirm.action === "save") {
      setConfirm((prev) => ({ ...prev, loading: true }));
      await handleSave();
      setConfirm({ open: false, action: null, loading: false, title: "", message: "", confirmText: "Aceptar" });
      return;
    }
    if (confirm.action === "clear") {
      handleClear();
      setConfirm({ open: false, action: null, loading: false, title: "", message: "", confirmText: "Aceptar" });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-[#6b7280]">
              Nueva Cotización
            </h1>
            <p className="text-gray-600 mt-1">
              Completa los datos del cliente, selecciona recetas y genera una propuesta.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onShowHistory}
              className="bg-[#e7c78a] hover:bg-[#d4b06f] text-white font-semibold px-4 py-2 rounded-md shadow-sm transition-colors"
            >
              Ver historial
            </button>
            <button
              onClick={() =>
                openConfirm({
                  action: "clear",
                  title: "Limpiar formulario",
                  message: "Se perderán todos los datos actuales. ¿Deseas continuar?",
                  confirmText: "Limpiar",
                })
              }
              className="bg-[#f5f2eb] hover:bg-[#e5dfd8] text-gray-800 font-semibold px-4 py-2 rounded-md shadow-sm transition-colors border border-[#e5dfd8]"
            >
              Limpiar
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <section className="bg-white p-6 rounded-lg border shadow-sm" style={{ borderColor: "#e5dfd8" }}>
              <h2 className="text-lg font-semibold text-gray-800 mb-5 pb-3 border-b" style={{ borderColor: "#e5dfd8" }}>
                Información del cliente
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField 
                  label="Nombre completo" 
                  description="Nombre del cliente"
                >
                  <Input
                    type="text"
                    className="w-full"
                    placeholder="Ej: Juan García"
                    value={clientInfo.name}
                    onChange={(e) =>
                      setClientInfo((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </FormField>
                <FormField 
                  label="Teléfono" 
                  description="Número de contacto"
                >
                  <Input
                    type="tel"
                    className="w-full"
                    placeholder="Ej: +57 300 123 4567"
                    value={clientInfo.phone}
                    onChange={(e) =>
                      setClientInfo((prev) => ({ ...prev, phone: e.target.value }))
                    }
                  />
                </FormField>
                <FormField 
                  label="Email" 
                  description="Correo electrónico"
                >
                  <Input
                    type="email"
                    className="w-full"
                    placeholder="Ej: juan@example.com"
                    value={clientInfo.email}
                    onChange={(e) =>
                      setClientInfo((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </FormField>
              </div>
            </section>

            <section className="bg-white p-6 rounded-lg border shadow-sm" style={{ borderColor: "#e5dfd8" }}>
              <h2 className="text-lg font-semibold text-gray-800 mb-5 pb-3 border-b" style={{ borderColor: "#e5dfd8" }}>
                Información del evento
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField 
                  label="Tipo de evento" 
                  description="Categoría del evento"
                >
                  <Select className="w-full"
                    value={eventInfo.eventType}
                    onChange={(e) =>
                      setEventInfo((prev) => ({
                        ...prev,
                        eventType: e.target.value,
                      }))
                    }
                  >
                    {EVENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField 
                  label="Número de invitados" 
                  description="Cantidad total de personas"
                >
                  <Input type="number" min="1" className="w-full"
                    placeholder="Ej: 50"
                    value={eventInfo.numberOfGuests}
                    onChange={(e) =>
                      setEventInfo((prev) => ({
                        ...prev,
                        numberOfGuests: e.target.value,
                      }))
                    }
                  />
                </FormField>
                <FormField 
                  label="Fecha del evento" 
                  description="Cuándo es el evento"
                >
                  <Input type="date" className="w-full"
                    min={minEventDate}
                    value={eventInfo.eventDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val && val < minEventDate) {
                        showToast('Selecciona una fecha desde hoy en adelante', 'error');
                        // forzar a la fecha mínima
                        setEventInfo((prev) => ({ ...prev, eventDate: minEventDate }));
                      } else {
                        setEventInfo((prev) => ({ ...prev, eventDate: val }));
                      }
                    }}
                  />
                </FormField>
                <FormField 
                  label="Hora del evento" 
                  description="A qué hora comienza"
                >
                  <Input type="time" className="w-full"
                    value={eventInfo.eventTime}
                    onChange={(e) =>
                      setEventInfo((prev) => ({
                        ...prev,
                        eventTime: e.target.value,
                      }))
                    }
                  />
                </FormField>
                <FormField 
                  label="Dirección" 
                  description="Ubicación del evento"
                >
                  <Input type="text" className="w-full"
                    placeholder="Ej: Calle 10 #50-30, Bogotá"
                    value={eventInfo.location.address}
                    onChange={(e) =>
                      setEventInfo((prev) => ({
                        ...prev,
                        location: { ...prev.location, address: e.target.value },
                      }))
                    }
                  />
                </FormField>
                <FormField 
                  label="Nombre del lugar" 
                  description="Salón, hotel, etc."
                >
                  <Input type="text" className="w-full"
                    placeholder="Ej: Salón Mi Gusto"
                    value={eventInfo.location.venueName}
                    onChange={(e) =>
                      setEventInfo((prev) => ({
                        ...prev,
                        location: { ...prev.location, venueName: e.target.value },
                      }))
                    }
                  />
                </FormField>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField 
                  label="Restricciones alimentarias" 
                  description="Alergias, preferencias, etc."
                >
                  <Input type="text" className="w-full"
                    placeholder="Ej: Sin gluten, veganos, alérgicos a frutos secos"
                    value={eventInfo.dietaryRestrictions}
                    onChange={(e) =>
                      setEventInfo((prev) => ({
                        ...prev,
                        dietaryRestrictions: e.target.value,
                      }))
                    }
                  />
                </FormField>
                <FormField 
                  label="Requerimientos especiales" 
                  description="Servicio, decoración, etc."
                >
                  <Input type="text" className="w-full"
                    placeholder="Ej: Meseros, decoración temática"
                    value={eventInfo.specialRequirements}
                    onChange={(e) =>
                      setEventInfo((prev) => ({
                        ...prev,
                        specialRequirements: e.target.value,
                      }))
                    }
                  />
                </FormField>
                <FormField 
                  label="Cocina preferida" 
                  description="Estilo o tipo de comida"
                >
                  <Input type="text" className="w-full"
                    placeholder="Ej: Francesa, italiana, fusión"
                    value={eventInfo.preferredCuisine}
                    onChange={(e) =>
                      setEventInfo((prev) => ({
                        ...prev,
                        preferredCuisine: e.target.value,
                      }))
                    }
                  />
                </FormField>
                <FormField 
                  label="Notas adicionales" 
                  description="Información relevante"
                >
                  <Input type="text" className="w-full"
                    placeholder="Ej: Presupuesto flexible, margen de negociación"
                    value={eventInfo.additionalNotes}
                    onChange={(e) =>
                      setEventInfo((prev) => ({
                        ...prev,
                        additionalNotes: e.target.value,
                      }))
                    }
                  />
                </FormField>
              </div>
            </section>

            <section className="bg-white p-6 rounded-lg border shadow-sm" style={{ borderColor: "#e5dfd8" }}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5 pb-3 border-b" style={{ borderColor: "#e5dfd8" }}>
                <h2 className="text-lg font-semibold text-gray-800">
                  Recetas del menú
                </h2>
                <div className="min-w-[280px]">
                  <SearchableSelect
                    items={availableRecipes}
                    value={selectedRecipeOption}
                    onChange={handleRecipeSelect}
                    getLabel={(item) => item.name}
                    getValue={(item) => item._id}
                    placeholder={
                      isLoadingRecipes
                        ? "Cargando recetas..."
                        : "+ Agregar receta"
                    }
                    emptyMessage="No hay recetas disponibles"
                  />
                </div>
              </div>

              {selectedRecipes.length === 0 ? (
                <div className="py-12 text-center text-gray-500">
                  <p className="text-sm">
                    Aún no has agregado recetas. Selecciona al menos una para continuar.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedRecipes.map((recipe) => (
                    <div key={recipe.recipeId} className="border rounded-lg p-4" style={{ borderColor: "#e5dfd8", backgroundColor: "#f5f2eb" }}>
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-800">
                            {recipe.recipeName}
                          </h3>
                          <div className="text-xs text-gray-500 mt-1">
                            {recipe.selectedIngredients.length} ingredientes
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="flex items-center gap-2 bg-white border rounded-md px-2 py-1" style={{ borderColor: "#e5dfd8" }}>
                            <label className="text-xs font-medium text-gray-600">
                              Porciones:
                            </label>
                            <input
                              type="number"
                              min="1"
                              className="w-16 border-0 outline-none text-center focus:ring-0"
                              value={recipe.servings}
                              onChange={(e) =>
                                handleRecipeServingsChange(
                                  recipe.recipeId,
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleRecipe(recipe.recipeId)}
                            className="text-xs px-2 py-1 text-[#9FB9B3] hover:text-[#8aa59f] font-medium"
                          >
                            {recipe.expanded ? "↑ Ocultar" : "↓ Ver"} ingredientes
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveRecipe(recipe.recipeId)}
                            className="text-xs px-2 py-1 text-red-500 hover:text-red-700 font-medium"
                          >
                            ✕ Quitar
                          </button>
                        </div>
                      </div>

                      {recipe.expanded && (
                        <div className="mt-4 pt-3 border-t space-y-2" style={{ borderColor: "#e5dfd8" }}>
                          <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs font-medium text-gray-600 mb-2">
                            <div className="md:col-span-2">Ingrediente</div>
                            <div>Cantidad</div>
                            <div>Unidad</div>
                          </div>
                          {recipe.selectedIngredients.map((ing, index) => (
                            <div
                              key={`${recipe.recipeId}-${index}`}
                              className="grid grid-cols-1 md:grid-cols-5 gap-2 items-center"
                            >
                              <div className="md:col-span-2 text-sm text-gray-700 bg-white p-2 rounded border" style={{ borderColor: "#e5dfd8" }}>
                                {ing.name || "Ingrediente"}
                              </div>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="border rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent outline-none" style={{ borderColor: "#e5dfd8" }}
                                value={ing.quantity}
                                onChange={(e) =>
                                  handleIngredientChange(
                                    recipe.recipeId,
                                    index,
                                    "quantity",
                                    e.target.value
                                  )
                                }
                              />
                              <input
                                type="text"
                                className="border rounded-md px-2 py-2 text-sm focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent outline-none" style={{ borderColor: "#e5dfd8" }}
                                placeholder="g, ml, oz..."
                                value={ing.unit}
                                onChange={(e) =>
                                  handleIngredientChange(
                                    recipe.recipeId,
                                    index,
                                    "unit",
                                    e.target.value
                                  )
                                }
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="bg-white p-6 rounded-lg border shadow-sm" style={{ borderColor: "#e5dfd8" }}>
              <h2 className="text-lg font-semibold text-gray-800 mb-5 pb-3 border-b" style={{ borderColor: "#e5dfd8" }}>
                Descuentos e impuestos
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField 
                  label="Tipo de descuento" 
                  description="Porcentaje o monto fijo"
                >
                  <Select className="w-full"
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value)}
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto fijo ($)</option>
                  </Select>
                </FormField>
                <FormField 
                  label="Valor del descuento" 
                  description="Descuento a aplicar"
                >
                  <Input type="number" min="0" className="w-full"
                    placeholder="0"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                  />
                </FormField>
                <FormField 
                  label="IVA (%)" 
                  description="Impuesto al valor agregado"
                >
                  <Input type="number" min="0" max="100" className="w-full"
                    placeholder="0"
                    value={ivaPercent}
                    onChange={(e) => setIvaPercent(e.target.value)}
                  />
                </FormField>
                <FormField 
                  label="Servicio (%)" 
                  description="Propina o costo de servicio"
                >
                  <Input type="number" min="0" max="100" className="w-full"
                    placeholder="0"
                    value={servicePercent}
                    onChange={(e) => setServicePercent(e.target.value)}
                  />
                </FormField>
                <FormField 
                  label="Otros (%)" 
                  description="Otros impuestos o recargos"
                >
                  <Input type="number" min="0" max="100" className="w-full"
                    placeholder="0"
                    value={otherPercent}
                    onChange={(e) => setOtherPercent(e.target.value)}
                  />
                </FormField>
              </div>
            </section>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleCalculate}
                disabled={isCalculating}
                className="bg-[#adc4bc] hover:bg-[#9db1a8] text-white font-semibold px-4 py-2 rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCalculating ? "Calculando..." : "Calcular cotización"}
              </button>
              <button
                onClick={() =>
                  openConfirm({
                    action: "save",
                    title: "Guardar cotización",
                    message: "Se guardará la cotización con los datos actuales. ¿Confirmas?",
                    confirmText: "Guardar",
                  })
                }
                disabled={isSaving || !calculation}
                className="bg-[#edcab4] hover:bg-[#ddb89f] text-[#6b7280] font-semibold px-4 py-2 rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? "Guardando..." : "Guardar cotización"}
              </button>
            </div>
          </div>

          {/* Resumen lateral */}
          <aside className="lg:row-span-2">
            <div className="bg-white p-6 rounded-lg border shadow-sm sticky top-8" style={{ borderColor: "#e5dfd8" }}>
              <h2 className="text-lg font-semibold text-gray-800 mb-4 pb-3 border-b" style={{ borderColor: "#e5dfd8" }}>
                Resumen de costos
              </h2>
              {calculation ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium text-gray-800">{formatCurrency(calculation.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Descuento</span>
                      <span className="font-medium text-gray-800">
                        -{formatCurrency(calculation.discountAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Impuestos</span>
                      <span className="font-medium text-gray-800">
                        +{formatCurrency(calculation.taxes?.totalTaxes)}
                      </span>
                    </div>
                    <div className="border-t pt-2 mt-2 flex justify-between" style={{ borderColor: "#e5dfd8" }}>
                      <span className="font-semibold text-gray-800">Total</span>
                      <span className="text-lg font-bold" style={{ color: "#2f6f5c" }}>
                        {formatCurrency(calculation.totalAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="border-t pt-4" style={{ borderColor: "#e5dfd8" }}>
                    <h3 className="font-semibold text-gray-700 mb-3 text-sm">
                      Desglose de recetas
                    </h3>
                    <div className="space-y-3">
                      {calculation.recipes?.map((recipe) => (
                        <div key={recipe.recipeId} className="text-sm p-3 rounded" style={{ backgroundColor: "#f5f2eb" }}>
                          <div className="flex justify-between font-medium text-gray-800 mb-1">
                            <span className="truncate">{recipe.recipeName}</span>
                            <span className="ml-2">{formatCurrency(recipe.totalCost)}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {recipe.servings} porciones • {formatCurrency(recipe.costPerServing)}/porción
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4" style={{ borderColor: "#e5dfd8" }}>
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: "#f5e8d8", color: "#8b5a2b" }}>
                      ⊘ Pendiente de guardar
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-6 text-center">
                  Completa el formulario y calcula para ver el resumen.
                </p>
              )}
            </div>
          </aside>
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />

      <ConfirmationModal
        isOpen={confirm.open}
        title={confirm.title}
        message={confirm.message}
        confirmText={confirm.confirmText}
        cancelText="Cancelar"
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirm({ open: false, action: null, loading: false, title: "", message: "", confirmText: "Aceptar" })}
        loading={confirm.loading}
      />
    </div>
  );
};

export default ChefQuoteForm;