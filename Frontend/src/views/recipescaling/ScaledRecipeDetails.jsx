import React from "react";
import Button from "../../components/ui/Button";
import { jsPDF } from "jspdf";

const ScaledRecipeDetails = ({ scaledRecipe }) => {
  const exportPDF = () => {
    if (!scaledRecipe) return;
    const doc = new jsPDF();
    let y = 15;

    // Título
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41);
    doc.text("Detalle de Escalado de Receta", 105, y, { align: "center" });
    y += 15;

    // Información de la receta
    doc.setFillColor(173, 196, 188);
    doc.rect(10, y, 190, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Información de Receta", 15, y + 7);
    y += 17;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Nombre: ${scaledRecipe.recipeName}`, 15, y);
    y += 7;
    doc.text(`Categoría: ${scaledRecipe.category}`, 15, y);
    y += 7;
    doc.text(
      `Porciones originales: ${scaledRecipe.scaling.originalServings}`,
      15,
      y
    );
    y += 7;
    doc.text(`Porciones nuevas: ${scaledRecipe.scaling.newServings}`, 15, y);
    y += 7;
    doc.text(
      `Factor de escalado: ${scaledRecipe.scaling.scaleFactor.toFixed(2)}x`,
      15,
      y
    );
    y += 12;

    // Ingredientes escalados
    doc.setFillColor(173, 196, 188);
    doc.rect(10, y, 190, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Ingredientes Escalados", 15, y + 7);
    y += 15;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text("Ingrediente", 15, y);
    doc.text("Original", 75, y);
    doc.text("Escalado", 115, y);
    doc.text("Costo", 165, y);
    y += 7;

    doc.setFont("helvetica", "normal");
    scaledRecipe.ingredients.forEach((ing) => {
      if (y > 270) {
        doc.addPage();
        y = 15;
      }
      doc.text(ing.ingredientName.substring(0, 25), 15, y);
      doc.text(
        `${ing.originalQuantity} ${ing.originalUnit}`,
        75,
        y
      );
      doc.text(
        `${ing.scaledQuantity} ${ing.scaledUnit}`,
        115,
        y
      );
      doc.text(`$${ing.cost.toFixed(2)}`, 165, y);
      doc.setDrawColor(200);
      doc.line(10, y + 2, 200, y + 2);
      y += 7;
    });

    y += 5;

    // Costos
    doc.setFillColor(173, 196, 188);
    doc.rect(10, y, 190, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Resumen de Costos", 15, y + 7);
    y += 15;

    const costsData = [
      ["Costo total", `$${scaledRecipe.costs.totalCost.toFixed(2)}`],
      ["Costo por porción", `$${scaledRecipe.costs.costPerServing.toFixed(2)}`],
      ["Margen de ganancia", scaledRecipe.costs.profitMargin],
      ["Precio por porción", `$${scaledRecipe.costs.pricePerServing.toFixed(2)}`],
      ["Precio total", `$${scaledRecipe.costs.totalPrice.toFixed(2)}`],
      ["Ganancia total", `$${scaledRecipe.costs.totalProfit.toFixed(2)}`],
      ["Ganancia por porción", `$${scaledRecipe.costs.profitPerServing.toFixed(2)}`],
    ];

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    const colX = [15, 120];
    costsData.forEach((row) => {
      doc.text(row[0], colX[0], y);
      doc.setFont("helvetica", "bold");
      doc.text(row[1], colX[1], y);
      doc.setFont("helvetica", "normal");
      doc.line(10, y + 2, 200, y + 2);
      y += 7;
    });

    // Insumos (si hay)
    if (scaledRecipe.supplies && scaledRecipe.supplies.length > 0) {
      y += 5;
      if (y > 250) {
        doc.addPage();
        y = 15;
      }

      doc.setFillColor(239, 239, 239);
      doc.rect(10, y, 190, 10, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("Insumos Aproximados", 15, y + 7);
      y += 15;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      scaledRecipe.supplies.forEach((supply) => {
        if (y > 270) {
          doc.addPage();
          y = 15;
        }

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

        doc.text(`${supply.ingredientName}:`, 15, y);
        y += 5;
        doc.text(
          `  ${supply.quantityNeeded} ${supply.unit} ${approxText}`,
          15,
          y
        );
        y += 7;
      });
    }

    doc.save(`escalado_${scaledRecipe.recipeName}.pdf`);
  };

  return (
    <div className="p-3 md:p-4 space-y-3 md:space-y-4">
      {/* Información de Receta */}
      <div className="p-3 md:p-4 bg-[#adc4bc] rounded shadow">
        <h2 className="text-base md:text-lg font-bold mb-2 text-white">
          Información de Receta
        </h2>
        <div className="text-white space-y-1 text-sm md:text-base">
          <p>
            <strong>Nombre:</strong> {scaledRecipe.recipeName}
          </p>
          <p>
            <strong>Categoría:</strong> {scaledRecipe.category}
          </p>
          <p>
            <strong>Porciones originales:</strong>{" "}
            {scaledRecipe.scaling.originalServings}
          </p>
          <p>
            <strong>Porciones nuevas:</strong>{" "}
            {scaledRecipe.scaling.newServings}
          </p>
          <p>
            <strong>Factor de escalado:</strong>{" "}
            {scaledRecipe.scaling.scaleFactor.toFixed(2)}x
          </p>
        </div>
      </div>

      {/* Ingredientes escalados */}
      <div className="p-3 md:p-4 bg-white rounded shadow">
        <h2 className="text-base md:text-lg font-bold mb-2">
          Ingredientes Escalados
        </h2>
        
        {/* Vista móvil - tarjetas */}
        <div className="md:hidden space-y-2">
          {scaledRecipe.ingredients.map((ing, idx) => (
            <div
              key={idx}
              className="p-3 rounded border border-gray-300 bg-gray-50"
            >
              <div className="font-medium text-gray-800 mb-2">
                {ing.ingredientName}
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Original:</span>
                  <br />
                  {ing.originalQuantity} {ing.originalUnit}
                </div>
                <div>
                  <span className="font-medium">Escalado:</span>
                  <br />
                  {ing.scaledQuantity} {ing.scaledUnit}
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-300">
                <span className="font-bold text-gray-800">
                  Costo: ${ing.cost.toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Vista desktop - tabla */}
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
      </div>

      {/* Costos */}
      <div className="p-3 md:p-4 bg-white rounded shadow">
        <h2 className="text-base md:text-lg font-bold mb-2">
          Resumen de Costos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-2 md:gap-3">
          <div className="p-2 md:p-3 bg-gray-100 rounded text-sm md:text-base">
            <strong>Costo total:</strong> ${scaledRecipe.costs.totalCost.toFixed(2)}
          </div>
          <div className="p-2 md:p-3 bg-gray-100 rounded text-sm md:text-base">
            <strong>Costo por porción:</strong> $
            {scaledRecipe.costs.costPerServing.toFixed(2)}
          </div>
          <div className="p-2 md:p-3 bg-gray-100 rounded text-sm md:text-base">
            <strong>Margen de ganancia:</strong> {scaledRecipe.costs.profitMargin}
          </div>
          <div className="p-2 md:p-3 bg-gray-100 rounded text-sm md:text-base">
            <strong>Precio por porción:</strong> $
            {scaledRecipe.costs.pricePerServing.toFixed(2)}
          </div>
          <div className="p-2 md:p-3 bg-green-100 rounded text-sm md:text-base">
            <strong>Precio total:</strong> $
            {scaledRecipe.costs.totalPrice.toFixed(2)}
          </div>
          <div className="p-2 md:p-3 bg-green-100 rounded text-sm md:text-base">
            <strong>Ganancia total:</strong> $
            {scaledRecipe.costs.totalProfit.toFixed(2)}
          </div>
        </div>
      </div>

      {/* Insumos aproximados */}
      {scaledRecipe.supplies && scaledRecipe.supplies.length > 0 && (
        <div className="p-3 md:p-4 bg-white rounded shadow">
          <h2 className="text-base md:text-lg font-bold mb-2">
            Insumos Aproximados
          </h2>
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
                <div key={idx} className="p-2 md:p-3 bg-gray-100 rounded text-sm md:text-base">
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

      {/* Botón exportar */}
      <div className="flex justify-end">
        <Button 
          onClick={exportPDF} 
          className="w-full sm:w-auto bg-[#9bb3ac] hover:bg-[#adc4bc] text-sm md:text-base"
        >
          Exportar PDF
        </Button>
      </div>
    </div>
  );
};

export default ScaledRecipeDetails;