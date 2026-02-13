import React, { useEffect, useState } from "react";
import ingredient from "../../services/ingredient";
import IngredientModal from "../ingredients/IngredientsModal";
import IngredientSearch from "../ingredients/IngredientSearch";
import SearchableSelect from "../../components/ui/SearchableSelect";

const CloseIcon = ({ className = "w-5 h-5" }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const UNIT_LABELS = {
  g: "gramos",
  kg: "kilogramos",
  ml: "mililitros",
  l: "litros",
  oz: "onzas",
  unit: "unidad",
};

const formatUnit = (unit) => {
  if (!unit) return "";
  return UNIT_LABELS[unit] ? `${unit} (${UNIT_LABELS[unit]})` : unit;
};

const RecipeModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  onShowToast = null,
}) => {
  const [form, setForm] = useState({
    name: "",
    category: "cocktail",
    servings: 1,
    description: "",
    ingredients: [],
    instructions: [],
    imageFile: null, // archivo nuevo
    imageUrl: "", // URL imagen existente
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allIngredients, setAllIngredients] = useState([]);
  const [showIngredientModal, setShowIngredientModal] = useState(false);

  useEffect(() => {
    const loadIngredients = async () => {
      try {
        const data = await ingredient.getAll();
        console.log("🥕 Ingredientes cargados:", data);
        setAllIngredients(data);
      } catch (err) {
        console.error("❌ Error cargando ingredientes", err);
      }
    };

    if (isOpen) {
      loadIngredients();
    }
  }, [isOpen]);

  // Carga datos al abrir modal o cambiar initialData
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setForm({
          name: initialData.name || "",
          category: initialData.category || "cocktail",
          servings: initialData.servings || 1,
          description: initialData.description || "",
          ingredients: initialData.ingredients || [],
          instructions: initialData.instructions || [],
          imageFile: null,
          imageUrl: initialData.image || "", // ajustar según estructura de tu API
        });
      } else {
        resetForm();
        setForm((p) => ({ ...p, imageFile: null, imageUrl: "" }));
      }
    }
  }, [isOpen, initialData]);

  const resetForm = () => {
    setForm({
      name: "",
      category: "cocktail",
      servings: 1,
      description: "",
      ingredients: [],
      instructions: [],
      imageFile: null,
      imageUrl: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "servings") {
      const numberValue = Number(value);
      if (!isNaN(numberValue) && numberValue > 0) {
        setForm((p) => ({ ...p, [name]: numberValue }));
      }
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const addIngredient = () => {
    setForm((p) => ({
      ...p,
      ingredients: [
        ...p.ingredients,
        { _id: "", productId: "", ingredientName: "", quantity: 0, unit: "" },
      ],
    }));
  };

  const updateIngredient = (i, field, value) => {
    const copy = [...form.ingredients];
    copy[i][field] = field === "quantity" ? Number(value) : value;
    setForm((p) => ({ ...p, ingredients: copy }));
  };

  const removeIngredient = (i) => {
    const copy = [...form.ingredients];
    copy.splice(i, 1);
    setForm((p) => ({ ...p, ingredients: copy }));
  };

  const addInstruction = () => {
    setForm((p) => ({
      ...p,
      instructions: [...p.instructions, ""],
    }));
  };

  const updateInstruction = (i, value) => {
    const copy = [...form.instructions];
    copy[i] = value;
    setForm((p) => ({ ...p, instructions: copy }));
  };

  const removeInstruction = (i) => {
    const copy = [...form.instructions];
    copy.splice(i, 1);
    setForm((p) => ({ ...p, instructions: copy }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validIngredients = form.ingredients
      .filter(
        (ing) =>
          ing.productId &&
          ing.productId.trim() !== "" &&
          ing.ingredientName &&
          ing.ingredientName.trim() !== "" &&
          !isNaN(ing.quantity) &&
          Number(ing.quantity) > 0 &&
          ing.unit &&
          ing.unit.trim() !== ""
      )
      .map(({ _id, productId, ingredientName, quantity, unit }) => ({
        _id: _id || "",
        productId,
        ingredientName,
        quantity,
        unit,
      }));

    const validInstructions = form.instructions
      .map((instr) => (typeof instr === "string" ? instr.trim() : ""))
      .filter((instr) => instr !== "");

    if (validIngredients.length === 0) {
      alert("Debes agregar al menos un ingrediente válido.");
      setIsSubmitting(false);
      return;
    }

    if (validInstructions.length === 0) {
      alert("Debes agregar al menos una instrucción válida.");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();

    formData.append("name", form.name);
    formData.append("category", form.category);
    formData.append("servings", form.servings);
    formData.append("description", form.description);
    formData.append("ingredients", JSON.stringify(validIngredients));
    formData.append("instructions", JSON.stringify(validInstructions));

    // Solo adjuntar archivo nuevo si hay
    if (form.imageFile) {
      formData.append("image", form.imageFile);
    }

    try {
      console.log("Enviando receta con imagen...");
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error al guardar receta:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleIngredientSelect = (ingredient) => {
    setForm((p) => {
      if (p.ingredients.some((i) => i.productId === ingredient.productId)) {
        return p; // ya existe
      }

      return {
        ...p,
        ingredients: [
          ...p.ingredients,
          {
            _id: ingredient._id || "",
            productId: ingredient.productId || "",
            ingredientName: ingredient.name,
            quantity: 1,
            unit: ingredient.sizeUnit || "",
          },
        ],
      };
    });
  };

  const onNewIngredientCreated = (newIngredient) => {
    setForm((p) => ({
      ...p,
      ingredients: [
        ...p.ingredients,
        {
          _id: newIngredient._id || "",
          productId: newIngredient.productId || "",
          ingredientName: newIngredient.name,
          quantity: 1,
          unit: newIngredient.sizeUnit || "",
          price: newIngredient.price || 0,
        },
      ],
    }));
    setShowIngredientModal(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-[#f5f2eb] rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-[#c8d0d2]">
          <h2 className="text-xl font-bold text-[#355f5b]">
            {initialData ? "Editar receta" : "Nueva receta"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* TOP SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* LEFT */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block font-medium text-[#355f5b] mb-1">
                  Nombre de la receta *
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#adc4bc]"
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block font-medium text-[#355f5b]">
                    Categoría
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="cocktail">Cocktail</option>
                    <option value="appetizer">Aperitivo</option>
                    <option value="main_course">Plato principal</option>
                    <option value="dessert">Postre</option>
                    <option value="beverage">Bebida</option>
                  </select>
                </div>

                <div className="w-32">
                  <label className="block font-medium text-[#355f5b]">
                    Porciones
                  </label>
                  <input
                    type="number"
                    min="1"
                    name="servings"
                    value={form.servings}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>
              </div>
            </div>

            {/* RIGHT IMAGE */}
            <ImageUpload form={form} setForm={setForm} />
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block font-medium text-[#355f5b] mb-1">
              Descripción
            </label>
            <textarea
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          {/* INGREDIENTES */}
          <div className="bg-white rounded-xl border border-[#c8d0d2] p-5 space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-lg font-semibold text-[#355f5b]">
                Ingredientes
              </h4>
              <button
                type="button"
                onClick={() => setShowIngredientModal(true)}
                className="text-sm px-3 py-1 rounded-lg bg-[#adc4bc]/30 text-[#355f5b]"
              >
                + Nuevo ingrediente
              </button>
            </div>

            {/* SEARCHABLE SELECT */}
            <SearchableSelect
              items={allIngredients}
              getLabel={(item) => item.name}
              getValue={(item) => item._id}
              value={null}
              onChange={handleIngredientSelect}
              placeholder="Busca un ingrediente..."
              emptyMessage="No se encontraron ingredientes"
            />

            {/* TABLE */}
            <div className="space-y-3 mt-4">
              <div className="grid grid-cols-12 text-xs font-semibold text-gray-500 px-2">
                <div className="col-span-5">Ingrediente</div>
                <div className="col-span-3">Cantidad</div>
                <div className="col-span-3">Unidad</div>
                <div className="col-span-1"></div>
              </div>

              {form.ingredients.map((ing, i) => (
                <div
                  key={i}
                  className="grid grid-cols-12 gap-3 items-center bg-[#f5f2eb] px-3 py-2 rounded-lg"
                >
                  <div className="col-span-5">
                    <input
                      value={ing.ingredientName}
                      disabled
                      className="w-full bg-gray-100 border rounded-md px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="col-span-3">
                    <input
                      type="number"
                      min="0"
                      value={ing.quantity}
                      onChange={(e) =>
                        updateIngredient(i, "quantity", e.target.value)
                      }
                      className="w-full border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-[#adc4bc]"
                    />
                  </div>

                  <div className="col-span-3">
                    <input
                      value={formatUnit(ing.unit)}
                      disabled
                      className="w-full bg-gray-100 border rounded-md px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="col-span-1 flex justify-center">
                    <button
                      type="button"
                      onClick={() => removeIngredient(i)}
                      className="text-red-500 text-lg font-bold"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* INSTRUCCIONES */}
          <div>
            <h4 className="font-medium text-[#355f5b] mb-2">Instrucciones</h4>

            {form.instructions.map((s, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  placeholder={`Paso ${i + 1}`}
                  value={s}
                  onChange={(e) => updateInstruction(i, e.target.value)}
                  className="flex-1 border rounded-md px-3 py-2"
                />
                <button
                  type="button"
                  onClick={() => removeInstruction(i)}
                  className="text-red-500 font-bold px-2"
                >
                  ×
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={addInstruction}
              className="text-sm text-[#9FB9B3]"
            >
              + Agregar paso
            </button>
          </div>

          {/* ACTIONS */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-lg text-white bg-[#e7c78a]"
            >
              {isSubmitting ? "Guardando..." : "Guardar receta"}
            </button>
          </div>
        </form>
      </div>

      {showIngredientModal && (
        <IngredientModal
          isOpen={showIngredientModal}
          onClose={() => setShowIngredientModal(false)}
          onSubmit={onNewIngredientCreated}
        />
      )}
    </div>
  );
};

const ImageUpload = ({ form, setForm }) => {
  const handleFile = (file) => {
    if (!file) return;
    setForm((p) => ({ ...p, imageFile: file, imageUrl: "" }));
  };

  return (
    <div
      className="border-2 border-dashed rounded-lg h-48 flex items-center justify-center text-center cursor-pointer hover:border-[#D4B5A5] transition relative"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleFile(e.dataTransfer.files[0]);
      }}
      onClick={() => document.getElementById("imageInput").click()}
    >
      <input
        id="imageInput"
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {!form.imageFile && form.imageUrl ? (
        <div className="relative w-full h-full">
          <img
            src={form.imageUrl}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setForm((p) => ({ ...p, imageUrl: "", imageFile: null }));
            }}
            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full px-2"
          >
            ✕
          </button>
        </div>
      ) : form.imageFile ? (
        <div className="relative w-full h-full">
          <img
            src={URL.createObjectURL(form.imageFile)}
            alt="Preview"
            className="w-full h-full object-cover rounded-lg"
          />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setForm((p) => ({ ...p, imageFile: null }));
            }}
            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full px-2"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="text-gray-400 text-sm px-4">
          <p className="font-medium">Arrastra una imagen</p>
          <p>o haz click para subir</p>
        </div>
      )}
    </div>
  );
};

export default RecipeModal;
