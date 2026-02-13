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
    <div className="space-y-3 md:space-y-0 md:grid md:grid-cols-4 md:gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Receta</label>
        <select
          className="w-full border rounded p-2 text-sm md:text-base focus:ring-2 focus:ring-[#9bb3ac] focus:border-transparent"
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
        <label className="block text-sm font-medium mb-1">
          Porciones originales
        </label>
        <input
          className="w-full border rounded p-2 bg-gray-100 text-sm md:text-base"
          value={selectedRecipe?.servings || ""}
          readOnly
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Nuevas porciones
        </label>
        <input
          type="number"
          min="1"
          className="w-full border rounded p-2 text-sm md:text-base focus:ring-2 focus:ring-[#9bb3ac] focus:border-transparent"
          value={newServings}
          onChange={(e) => setNewServings(e.target.value)}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Margen de ganancia en %
        </label>
        <input
          type="number"
          step="0.1"
          className="w-full border rounded p-2 text-sm md:text-base focus:ring-2 focus:ring-[#9bb3ac] focus:border-transparent"
          value={profitMargin}
          placeholder="Ej: 1.2 para 20%"
          onChange={(e) => setProfitMargin(e.target.value)}
        />
      </div>

      <div className="md:col-span-4 flex justify-end pt-2 md:pt-0">
        <Button 
          onClick={handleSubmit} 
          className="w-full sm:w-auto bg-[#9bb3ac] hover:bg-[#adc4bc] text-sm md:text-base"
        >
          Calcular Ingredientes
        </Button>
      </div>
    </div>
  );
}