import { useEffect, useMemo, useState } from "react";
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
  
  const [clientInfo, setClientInfo] = useState({
    name: "",
    email: "",
    phone: "",
  });

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
        const response = await recipeService.getAllRecipes();
        const data = response.data || response;
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

  const handleSubmitRequest = async () => {
    // Validaciones
    if (!clientInfo.name || !clientInfo.email || !clientInfo.phone) {
      showToast("Por favor completa tu información de contacto", "error");
      return;
    }

    if (!eventInfo.numberOfGuests || Number(eventInfo.numberOfGuests) <= 0) {
      showToast("Ingresa el número de invitados", "error");
      return;
    }

    if (!eventInfo.eventDate || !eventInfo.eventTime) {
      showToast("Ingresa la fecha y hora del evento", "error");
      return;
    }

    if (!eventInfo.location.address) {
      showToast("Ingresa la dirección del evento", "error");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        clientInfo: {
          name: clientInfo.name,
          email: clientInfo.email,
          phone: clientInfo.phone,
        },
        eventInfo: {
          ...eventInfo,
          numberOfGuests: Number(eventInfo.numberOfGuests),
        },
        budgetRange: {
          min: Number(budgetRange.min) || 0,
          max: Number(budgetRange.max) || 0,
        },
        estimatedCost: estimate || 0,
      };

      await quotationService.createClientRequest(payload);
      showToast("Solicitud enviada exitosamente. El chef te contactará pronto.", "success");
      
      // Limpiar formulario después de enviar
      setTimeout(() => {
        handleClear();
      }, 2000);
    } catch (error) {
      console.error("Error submitting request:", error);
      showToast(error?.message || "Error al enviar la solicitud", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setClientInfo({
      name: "",
      email: "",
      phone: "",
    });
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
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 pb-6 border-b" style={{ borderColor: "#e5dfd8" }}>
          <h1 className="text-3xl font-semibold text-gray-800">
            Solicitar Cotización
          </h1>
          <p className="text-gray-600 mt-2">
            Completa tus datos y preferencias. Nuestros chefs te contactarán con una propuesta personalizada.
          </p>
        </div>

        <div className="space-y-6">
          {/* Información de contacto */}
          <section className="bg-white border rounded-lg p-6 shadow-sm" style={{ borderColor: "#e5dfd8" }}>
            <h2 className="text-lg font-semibold text-gray-800 mb-5 pb-3 border-b" style={{ borderColor: "#e5dfd8" }}>
              Tu información de contacto
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField 
                label="Nombre completo *" 
                description="¿Cómo te llamas?"
              >
                <input
                  type="text"
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#adc4bc] focus:border-transparent outline-none transition"
                  style={{ borderColor: "#e5dfd8" }}
                  placeholder="Ej: Juan Pérez"
                  value={clientInfo.name}
                  onChange={(e) =>
                    setClientInfo((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </FormField>
              <FormField 
                label="Correo electrónico *" 
                description="Tu email"
              >
                <input
                  type="email"
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#adc4bc] focus:border-transparent outline-none transition"
                  style={{ borderColor: "#e5dfd8" }}
                  placeholder="Ej: juan@email.com"
                  value={clientInfo.email}
                  onChange={(e) =>
                    setClientInfo((prev) => ({ ...prev, email: e.target.value }))
                  }
                />
              </FormField>
              <FormField 
                label="Teléfono *" 
                description="Para contactarte"
              >
                <input
                  type="tel"
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#adc4bc] focus:border-transparent outline-none transition"
                  style={{ borderColor: "#e5dfd8" }}
                  placeholder="Ej: +57 300 123 4567"
                  value={clientInfo.phone}
                  onChange={(e) =>
                    setClientInfo((prev) => ({ ...prev, phone: e.target.value }))
                  }
                />
              </FormField>
            </div>
          </section>

          {/* Información del evento */}
          <section className="bg-white border rounded-lg p-6 shadow-sm" style={{ borderColor: "#e5dfd8" }}>
            <h2 className="text-lg font-semibold text-gray-800 mb-5 pb-3 border-b" style={{ borderColor: "#e5dfd8" }}>
              Información del evento
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField 
                label="Tipo de evento" 
                description="Categoría del evento"
              >
                <select
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#adc4bc] focus:border-transparent outline-none transition bg-white"
                  style={{ borderColor: "#e5dfd8" }}
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
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#adc4bc] focus:border-transparent outline-none transition"
                  style={{ borderColor: "#e5dfd8" }}
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
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#adc4bc] focus:border-transparent outline-none transition"
                  style={{ borderColor: "#e5dfd8" }}
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
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#adc4bc] focus:border-transparent outline-none transition"
                  style={{ borderColor: "#e5dfd8" }}
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
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#adc4bc] focus:border-transparent outline-none transition"
                  style={{ borderColor: "#e5dfd8" }}
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
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#adc4bc] focus:border-transparent outline-none transition"
                  style={{ borderColor: "#e5dfd8" }}
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
          <section className="bg-white border rounded-lg p-6 shadow-sm" style={{ borderColor: "#e5dfd8" }}>
            <h2 className="text-lg font-semibold text-gray-800 mb-5 pb-3 border-b" style={{ borderColor: "#e5dfd8" }}>
              Preferencias y detalles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                label="Restricciones alimentarias" 
                description="Alergias, preferencias, etc."
              >
                <input
                  type="text"
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#adc4bc] focus:border-transparent outline-none transition"
                  style={{ borderColor: "#e5dfd8" }}
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
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#adc4bc] focus:border-transparent outline-none transition"
                  style={{ borderColor: "#e5dfd8" }}
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
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#adc4bc] focus:border-transparent outline-none transition"
                  style={{ borderColor: "#e5dfd8" }}
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
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#adc4bc] focus:border-transparent outline-none transition"
                  style={{ borderColor: "#e5dfd8" }}
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
          <section className="bg-white border rounded-lg p-6 shadow-sm" style={{ borderColor: "#e5dfd8" }}>
            <h2 className="text-lg font-semibold text-gray-800 mb-2 pb-3 border-b" style={{ borderColor: "#e5dfd8" }}>
              Recetas sugeridas <span className="text-sm font-normal text-gray-500">(opcional)</span>
            </h2>
            <p className="text-sm text-gray-600 mb-4 mt-4">
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
                    className="flex items-center justify-between p-3 rounded-lg border"
                    style={{ backgroundColor: "#f5f2eb", borderColor: "#e5dfd8" }}
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
                      className="text-sm px-3 py-1 text-red-500 hover:text-red-700 font-medium transition"
                    >
                      ✕ Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Presupuesto */}
          <section className="bg-white border rounded-lg p-6 shadow-sm" style={{ borderColor: "#e5dfd8" }}>
            <h2 className="text-lg font-semibold text-gray-800 mb-2 pb-3 border-b" style={{ borderColor: "#e5dfd8" }}>
              Rango de presupuesto <span className="text-sm font-normal text-gray-500">(opcional)</span>
            </h2>
            <p className="text-sm text-gray-600 mb-4 mt-4">
              Indica tu rango de inversión para recibir propuestas que se ajusten a tu presupuesto.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField 
                label="Presupuesto mínimo" 
                description="Monto mínimo a invertir"
              >
                <input
                  type="number"
                  min="0"
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#adc4bc] focus:border-transparent outline-none transition"
                  style={{ borderColor: "#e5dfd8" }}
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
                  className="w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-[#adc4bc] focus:border-transparent outline-none transition"
                  style={{ borderColor: "#e5dfd8" }}
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

          {/* Estimado (si existe) */}
          {estimate !== null && (
            <div className="bg-white border rounded-lg p-6 shadow-sm" style={{ borderColor: "#e5dfd8" }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-1">Costo estimado base</h3>
                  <p className="text-2xl font-bold" style={{ color: "#2f6f5c" }}>
                    {formatCurrency(estimate)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    * Este es un estimado aproximado. El costo final puede variar según los detalles específicos.
                  </p>
                </div>
                <div className="h-16 w-16 rounded-full flex items-center justify-center" style={{ backgroundColor: "#f5f2eb" }}>
                  <span className="text-2xl">💰</span>
                </div>
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={handleSubmitRequest}
              disabled={isLoading}
              className="bg-[#2f6f5c] hover:bg-[#26564a] text-white font-semibold px-6 py-2.5 rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Enviando..." : "📨 Enviar solicitud de cotización"}
            </button>
            <button
              onClick={handleEstimate}
              disabled={isLoading}
              className="bg-[#adc4bc] hover:bg-[#9db1a8] text-white font-semibold px-6 py-2.5 rounded-md shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Calculando..." : "Ver estimado"}
            </button>
            <button
              onClick={() => setConfirm({ open: true, action: "clear", loading: false })}
              className="bg-[#f5f2eb] hover:bg-[#e5dfd8] text-gray-800 font-semibold px-6 py-2.5 rounded-md shadow-sm transition-colors border"
              style={{ borderColor: "#e5dfd8" }}
            >
              Limpiar formulario
            </button>
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
        onConfirm={handleClear}
        onCancel={() => setConfirm({ open: false, action: null, loading: false })}
        loading={confirm.loading}
      />
    </div>
  );
};

export default ClientQuoteForm;