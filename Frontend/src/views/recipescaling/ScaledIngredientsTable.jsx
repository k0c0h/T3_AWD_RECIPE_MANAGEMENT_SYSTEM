export default function ScaledIngredientsTable({ scaledRecipe }) {
  return (
    <div className="space-y-4 md:space-y-6">
      <h3 className="text-lg md:text-xl font-bold">Ingredientes Ajustados</h3>

      {/* Mobile list */}
      <div className="block md:hidden space-y-2">
        {scaledRecipe.ingredients.map((ing, idx) => (
          <div 
            key={idx} 
            className="p-3 rounded border bg-white" 
            style={{ borderColor: '#e5dfd8' }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="font-medium text-gray-800 mb-2">
                  {ing.ingredientName}
                </div>
                <div className="space-y-1 text-sm text-gray-700">
                  <div>
                    <span className="text-gray-500">Original:</span>{' '}
                    <span className="font-medium">
                      {ing.originalQuantity} {ing.originalUnit}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Escalado:</span>{' '}
                    <span className="font-medium">
                      {ing.scaledQuantity} {ing.scaledUnit}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Costo</div>
                <div className="font-bold text-gray-800">
                  ${ing.cost.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead className="bg-[#adc4bc] text-white">
            <tr>
              <th className="border px-2 py-1 text-left">Ingrediente</th>
              <th className="border px-2 py-1 text-left">Original</th>
              <th className="border px-2 py-1 text-left">Escalado</th>
              <th className="border px-2 py-1 text-left">Costo</th>
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
      </div>

      {/* Insumos aproximados */}
      {scaledRecipe.supplies?.length > 0 && (
        <div className="mt-4 md:mt-6">
          <h3 className="text-lg md:text-xl font-bold mb-3">
            Insumos aproximados
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            {scaledRecipe.supplies.map((supply, idx) => {
              let approxText = "";

              if (supply.licoresNeeded) {
                approxText = `≈ ${supply.licoresNeeded} botella${
                  supply.licoresNeeded > 1 ? "s" : ""
                }`;
              } else if (supply.unitsNeeded) {
                approxText = `≈ ${supply.unitsNeeded} unidad${
                  supply.unitsNeeded > 1 ? "es" : ""
                }`;
              }

              return (
                <div key={idx} className="p-3 bg-gray-100 rounded text-sm md:text-base">
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

      {/* Resumen de costos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="p-2 md:p-3 bg-gray-100 rounded text-sm md:text-base">
          <strong>Costo total:</strong> ${scaledRecipe.costs.totalCost}
        </div>
        <div className="p-2 md:p-3 bg-gray-100 rounded text-sm md:text-base">
          <strong>Costo por porción:</strong> $
          {scaledRecipe.costs.costPerServing}
        </div>
        <div className="p-2 md:p-3 bg-gray-100 rounded text-sm md:text-base">
          <strong>Precio por porción:</strong> $
          {scaledRecipe.costs.pricePerServing}
        </div>
        <div className="p-2 md:p-3 bg-gray-100 rounded text-sm md:text-base">
          <strong>Ganancia total:</strong> ${scaledRecipe.costs.totalProfit}
        </div>
      </div>
    </div>
  );
}