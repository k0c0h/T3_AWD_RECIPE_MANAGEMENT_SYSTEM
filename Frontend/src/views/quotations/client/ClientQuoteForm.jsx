import { useEffect, useMemo, useState } from "react";
import Button from "../../../components/ui/Button";
import Toast from "../../../components/ui/Toast";
import ConfirmationModal from "../../../components/ui/ConfirmationModal";
import SearchableSelect from "../../../components/ui/SearchableSelect";
import recipeService from "../../../services/recipe";
import quotationService from "../../../services/quotation";

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

const FormField = ({ label, description, children, className = "" }) => (
  <div className={`${className}`}>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    {description && (
      <p className="text-xs text-gray-500 mb-2">{description}</p>
    )}
    {children}
  </div>
);

const ClientQuoteForm = () => {
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [selectedRecipeOption, setSelectedRecipeOption] = useState(null);
  
  const [eventInfo, setEventInfo] = useState({
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

  const [budgetRange, setBudgetRange] = useState({ min: 0, max: 0 });
  const [estimate, setEstimate] = useState(null);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, action: null, loading: false });

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
    () => recipes.filter((r) => !selectedRecipes.some((s) => s._id === r._id)),
    [recipes, selectedRecipes]
  );

  const showToast = (message, type = "success") => {
    setToast({ id: Date.now(), message, type });
  };

  const handleRecipeSelect = (recipe) => {
    setSelectedRecipeOption(recipe);
    if (!recipe) return;
    if (selectedRecipes.some((r) => r._id === recipe._id)) {
      showToast("La receta ya fue agregada", "warn");
      setSelectedRecipeOption(null);
      return;
    }
    setSelectedRecipes((prev) => [...prev, recipe]);
    setSelectedRecipeOption(null);
  };

  const handleRemoveRecipe = (recipeId) => {
    setSelectedRecipes((prev) => prev.filter((r) => r._id !== recipeId));
  };

  const handleEstimate = async () => {
    if (!eventInfo.numberOfGuests || Number(eventInfo.numberOfGuests) <= 0) {
      showToast("Ingresa el número de invitados", "error");
      return;
    }

    if (Number(budgetRange.min) > Number(budgetRange.max) && Number(budgetRange.max) > 0) {
      showToast("El presupuesto mínimo no puede ser mayor al máximo", "error");
      return;
    }

    setIsLoading(true);
    try {
      const response = await quotationService.estimateClientRequest({
        eventInfo: {
          ...eventInfo,
          numberOfGuests: Number(eventInfo.numberOfGuests) || 0,
        },
        budgetRange: {
          min: Number(budgetRange.min) || 0,
          max: Number(budgetRange.max) || 0,
        },
      });
      setEstimate(response?.estimatedCost ?? null);
      showToast("Estimado calculado", "success");
    } catch (error) {
      console.error("Error estimating quote:", error);
      showToast(error?.message || "Error al estimar", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
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
    setBudgetRange({ min: 0, max: 0 });
    setEstimate(null);
  };

  return (
    <div className="min-h-screen bg-[#f5f2eb] p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-800">
            Solicitar Cotización
          </h1>
          <p className="text-gray-600 mt-1">
            Completa tus datos y preferencias. Nuestros chefs te contactarán con una propuesta personalizada.
          </p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
          {/* Información del evento */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-200">
              Información del evento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField 
                label="Tipo de evento" 
                description="Categoría del evento"
              >
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent outline-none transition"
                  value={eventInfo.eventType}
                  onChange={(e) =>
                    setEventInfo((prev) => ({ ...prev, eventType: e.target.value }))
                  }
                >
                  {EVENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField 
                label="Número de invitados" 
                description="Cantidad total de personas"
              >
                <input
                  type="number"
                  min="1"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent outline-none transition"
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
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent outline-none transition"
                  value={eventInfo.eventDate}
                  onChange={(e) =>
                    setEventInfo((prev) => ({
                      ...prev,
                      eventDate: e.target.value,
                    }))
                  }
                />
              </FormField>
              <FormField 
                label="Hora del evento" 
                description="A qué hora comienza"
              >
                <input
                  type="time"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent outline-none transition"
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
                className="md:col-span-2"
              >
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent outline-none transition"
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
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent outline-none transition"
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
          </section>

          {/* Preferencias */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-200">
              Preferencias y detalles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                label="Restricciones alimentarias" 
                description="Alergias, preferencias, etc."
              >
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent outline-none transition"
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
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent outline-none transition"
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
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent outline-none transition"
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
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent outline-none transition"
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

          {/* Recetas sugeridas */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-200">
              Recetas sugeridas (opcional)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Selecciona recetas específicas si lo deseas. Esto ayudará a los chefs a personalizar mejor tu propuesta.
            </p>
            <div className="mb-4">
              <SearchableSelect
                items={availableRecipes}
                value={selectedRecipeOption}
                onChange={handleRecipeSelect}
                getLabel={(item) => item.name}
                getValue={(item) => item._id}
                placeholder={
                  isLoadingRecipes ? "Cargando recetas..." : "+ Agregar receta"
                }
                emptyMessage="No hay recetas disponibles"
              />
            </div>

            {selectedRecipes.length > 0 && (
              <div className="space-y-2">
                {selectedRecipes.map((recipe) => (
                  <div
                    key={recipe._id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div>
                      <h3 className="font-medium text-gray-800">{recipe.name}</h3>
                      <p className="text-xs text-gray-500">
                        {recipe.servings} porciones • {recipe.ingredients?.length || 0} ingredientes
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveRecipe(recipe._id)}
                      className="text-sm px-3 py-1 text-red-500 hover:text-red-700 font-medium"
                    >
                      ✕ Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Presupuesto */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-5 pb-3 border-b border-gray-200">
              Rango de presupuesto (opcional)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                label="Presupuesto mínimo" 
                description="Monto mínimo a invertir"
              >
                <input
                  type="number"
                  min="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent outline-none transition"
                  placeholder="Ej: 500000"
                  value={budgetRange.min}
                  onChange={(e) =>
                    setBudgetRange((prev) => ({
                      ...prev,
                      min: e.target.value,
                    }))
                  }
                />
              </FormField>
              <FormField 
                label="Presupuesto máximo" 
                description="Monto máximo a invertir"
              >
                <input
                  type="number"
                  min="0"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-[#9FB9B3] focus:border-transparent outline-none transition"
                  placeholder="Ej: 2000000"
                  value={budgetRange.max}
                  onChange={(e) =>
                    setBudgetRange((prev) => ({
                      ...prev,
                      max: e.target.value,
                    }))
                  }
                />
              </FormField>
            </div>
          </section>

          {/* Acciones */}
          <div className="flex flex-wrap gap-3 pt-4">
            <Button 
              onClick={handleEstimate} 
              disabled={isLoading}
              className="bg-[#9FB9B3] hover:bg-[#8aa59f] text-white"
            >
              {isLoading ? "Calculando..." : "Ver estimado"}
            </Button>
            <Button
              onClick={() => setConfirm({ open: true, action: "clear", loading: false })}
              className="bg-gray-300 text-gray-800 hover:bg-gray-400"
            >
              Limpiar
            </Button>
            {estimate !== null && (
              <div className="inline-flex items-center px-4 py-2 bg-[#E8D5C7] text-gray-800 rounded-md">
                <span className="text-sm">Estimado base: </span>
                <span className="font-semibold ml-2">{formatCurrency(estimate)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast toast={toast} onClose={() => setToast(null)} />

      <ConfirmationModal
        isOpen={confirm.open}
        title="Limpiar formulario"
        message="Se perderán todos los datos actuales. ¿Deseas continuar?"
        confirmText="Limpiar"
        cancelText="Cancelar"
        onConfirm={() => {
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
          setBudgetRange({ min: 0, max: 0 });
          setSelectedRecipes([]);
          setEstimate(null);
          setConfirm({ open: false, action: null, loading: false });
        }}
        onCancel={() => setConfirm({ open: false, action: null, loading: false })}
        loading={confirm.loading}
      />
    </div>
  );
};

export default ClientQuoteForm;
