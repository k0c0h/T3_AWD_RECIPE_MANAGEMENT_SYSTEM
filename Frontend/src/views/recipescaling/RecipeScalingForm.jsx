import React, { useState } from "react";
import Button from "../../components/ui/Button";

export default function RecipeScalingForm({ recipes, onScale }) {
  const [recipeId, setRecipeId] = useState("");
  const [newServings, setNewServings] = useState(1);
  const [profitMargin, setProfitMargin] = useState(1);

  const selectedRecipe = recipes.find(r => r._id === recipeId);

  const handleSubmit = () => {
    if (!recipeId) return alert("Seleccione una receta");

    onScale({
      recipeId,
      newServings: Number(newServings),
      profitMargin: Number(profitMargin)
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div>
        <label className="block text-sm font-medium">Receta</label>
        <select
          className="w-full border rounded p-2"
          value={recipeId}
          onChange={(e) => setRecipeId(e.target.value)}
        >
          <option value="">Seleccione...</option>
          {recipes.map(r => (
            <option key={r._id} value={r._id}>{r.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Porciones originales</label>
        <input
          className="w-full border rounded p-2 bg-gray-100"
          value={selectedRecipe?.servings || ""}
          readOnly
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Nuevas porciones</label>
        <input
          type="number"
          min="1"
          className="w-full border rounded p-2"
          value={newServings}
          onChange={(e) => setNewServings(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Margen de ganancia en %</label>
        <input
          type="number"
          step="0.1"
          className="w-full border rounded p-2"
          value={profitMargin}
          placeholder="Ej: 1.2 para 20%"
          onChange={(e) => setProfitMargin(e.target.value)}
        />
      </div>

      <div className="md:col-span-4 flex justify-end">
        <Button onClick={handleSubmit} className="bg-[#9bb3ac] hover:bg-[#adc4bc]">
          Calcular Ingredientes
        </Button>
      </div>
    </div>
  );
}
