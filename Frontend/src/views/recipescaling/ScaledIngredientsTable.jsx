export default function ScaledIngredientsTable({ scaledRecipe }) {
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Ingredientes Ajustados</h3>

      <table className="w-full border border-gray-300">
        <thead className="bg-[#adc4bc]">
          <tr>
            <th className="border px-2 py-1">Ingrediente</th>
            <th className="border px-2 py-1">Original</th>
            <th className="border px-2 py-1">Escalado</th>
            <th className="border px-2 py-1">Costo</th>
          </tr>
        </thead>
        <tbody>
          {scaledRecipe.ingredients.map((ing, idx) => (
            <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : ""}>
              <td className="border px-2 py-1">{ing.ingredientName}</td>
              <td className="border px-2 py-1">
                {ing.originalQuantity} {ing.originalUnit}
              </td>
              <td className="border px-2 py-1">
                {ing.scaledQuantity} {ing.scaledUnit}
              </td>
              <td className="border px-2 py-1">${ing.cost.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {scaledRecipe.supplies?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-3">Insumos aproximados</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scaledRecipe.supplies.map((supply, idx) => {
              let approxText = "";

              if (supply.licoresNeeded) {
                approxText = `≈ ${supply.licoresNeeded} botella${supply.licoresNeeded > 1 ? "s" : ""}`;
              } else if (supply.unitsNeeded) {
                approxText = `≈ ${supply.unitsNeeded} unidad${supply.unitsNeeded > 1 ? "es" : ""}`;
              }

              return (
                <div key={idx} className="p-3 bg-gray-100 rounded">
                  <strong>{supply.ingredientName}</strong>
                  <br />
                  {supply.quantityNeeded} {supply.unit}
                  <br />
                  <em className="text-gray-600">{approxText}</em>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-3 bg-gray-100 rounded">
          <strong>Costo total:</strong> ${scaledRecipe.costs.totalCost}
        </div>
        <div className="p-3 bg-gray-100 rounded">
          <strong>Costo por porción:</strong> $
          {scaledRecipe.costs.costPerServing}
        </div>
        <div className="p-3 bg-gray-100 rounded">
          <strong>Precio por porción:</strong> $
          {scaledRecipe.costs.pricePerServing}
        </div>
        <div className="p-3 bg-gray-100 rounded">
          <strong>Ganancia total:</strong> ${scaledRecipe.costs.totalProfit}
        </div>
      </div>
    </div>
  );
}
