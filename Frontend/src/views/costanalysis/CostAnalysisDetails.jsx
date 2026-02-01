import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import costAnalysisService from "../../services/costAnalysis";
import Toast from "../../components/ui/Toast";
import Button from "../../components/ui/Button";
import { jsPDF } from "jspdf";

const CostAnalysisDetails = ({ analysis }) => {
  const exportPDF = () => {
    if (!analysis) return;
    const doc = new jsPDF();
    let y = 15;

    // Título
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(33, 37, 41);
    doc.text("Detalle de Análisis de Costos", 105, y, { align: "center" });
    y += 15;

    // Receta
    doc.setFillColor(173, 196, 188);
    doc.rect(10, y, 190, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("Receta", 15, y + 7);
    y += 17;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Nombre: ${analysis.recipeName}`, 15, y);
    y += 7;
    doc.text(`Porciones: ${analysis.servings}`, 15, y);
    y += 10;

    // Costos tabla
    const tableData = [
      ["Concepto", "Monto ($)"],
      ["Costo de ingredientes", analysis.ingredientsCost.toFixed(2)],
      ["Costo total del producto", analysis.totalCost.toFixed(2)],
      ["Costo por porción", analysis.costPerServing.toFixed(2)],
      [
        "Precio sugerido por porción",
        analysis.suggestedPricePerServing.toFixed(2),
      ],
    ];

    const colX = [15, 120];
    const rowHeight = 7;

    doc.setFillColor(173, 196, 188);
    doc.rect(10, y, 190, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Costos", 15, y + 7);
    y += 15;

    tableData.forEach((row, i) => {
      doc.setFont(
        i === 0 ? "helvetica" : "helvetica",
        i === 0 ? "bold" : "normal"
      );
      row.forEach((text, j) => doc.text(text.toString(), colX[j], y));
      doc.setDrawColor(200);
      doc.line(10, y + 2, 200, y + 2);
      y += rowHeight;
    });

    y += 5;

    // Impuestos tabla
    const taxData = [
      [
        "IVA",
        `${analysis.taxes.ivaAmount.toFixed(2)} (${
          analysis.taxes.ivaPercent
        }%)`,
      ],
      [
        "Servicio",
        `${analysis.taxes.serviceAmount.toFixed(2)} (${
          analysis.taxes.servicePercent
        }%)`,
      ],
      ["Total impuestos", analysis.taxes.totalTaxes.toFixed(2)],
    ];

    doc.setFillColor(239, 239, 239);
    doc.rect(10, y, 190, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.text("Impuestos", 15, y + 7);
    y += 15;

    taxData.forEach((row, i) => {
      row.forEach((text, j) => doc.text(text.toString(), colX[j], y));
      doc.line(10, y + 2, 200, y + 2);
      y += rowHeight;
    });

    y += 5;

    // Precio final destacado
    doc.setFillColor(173, 196, 188);
    doc.rect(10, y, 190, 12, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text(
      `Precio final: $${(
        analysis.suggestedPricePerServing + analysis.taxes.totalTaxes
      ).toFixed(2)}`,
      105,
      y + 8,
      { align: "center" }
    );

    doc.save(`analisis_${analysis.recipeName}.pdf`);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Receta */}
      <div className="p-4 bg-[#adc4bc] rounded shadow">
        <h2 className="text-lg font-bold mb-2">Receta</h2>
        <p>
          <strong>Nombre:</strong> {analysis.recipeName}
        </p>
        <p>
          <strong>Porciones:</strong> {analysis.servings}
        </p>
      </div>

      {/* Costos */}
      <div className="p-4 bg-white rounded shadow">
        <h2 className="text-lg font-bold mb-2">Costos</h2>
        <table className="w-full border border-gray-300">
          <thead className="bg-[#adc4bc]">
            <tr>
              <th className="border px-2 py-1 text-left">Concepto</th>
              <th className="border px-2 py-1 text-left">Monto ($)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-50">
              <td className="border px-2 py-1">Costo de ingredientes</td>
              <td className="border px-2 py-1">
                {analysis.ingredientsCost.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td className="border px-2 py-1">Costo total del producto</td>
              <td className="border px-2 py-1">
                {analysis.totalCost.toFixed(2)}
              </td>
            </tr>
            <tr className="bg-gray-50">
              <td className="border px-2 py-1">Costo por porción</td>
              <td className="border px-2 py-1">
                {analysis.costPerServing.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td className="border px-2 py-1">Precio sugerido por porción</td>
              <td className="border px-2 py-1">
                {analysis.suggestedPricePerServing.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Impuestos */}
      <div className="p-4 bg-white rounded shadow">
        <h2 className="text-lg font-bold mb-2">Impuestos</h2>
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-2 py-1 text-left">Concepto</th>
              <th className="border px-2 py-1 text-left">Monto ($)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="bg-gray-50">
              <td className="border px-2 py-1">
                IVA ({analysis.taxes.ivaPercent}%)
              </td>
              <td className="border px-2 py-1">
                {analysis.taxes.ivaAmount.toFixed(2)}
              </td>
            </tr>
            <tr>
              <td className="border px-2 py-1">
                Servicio ({analysis.taxes.servicePercent}%)
              </td>
              <td className="border px-2 py-1">
                {analysis.taxes.serviceAmount.toFixed(2)}
              </td>
            </tr>
            <tr className="bg-gray-50 font-bold">
              <td className="border px-2 py-1">Total impuestos</td>
              <td className="border px-2 py-1">
                {analysis.taxes.totalTaxes.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Precio final */}
      <div className="p-4 bg-[#adc4bc] rounded shadow text-center">
        <h2 className="text-lg font-bold mb-2">Precio final</h2>
        <p className="text-xl font-bold text-green-700">
          $
          {(
            analysis.suggestedPricePerServing + analysis.taxes.totalTaxes
          ).toFixed(2)}
        </p>
      </div>

      {/* Botón exportar */}
      <div className="flex justify-end">
        <div className="flex justify-end">
          <Button onClick={exportPDF}>Exportar PDF</Button>
        </div>
      </div>
    </div>
  );
};

export default CostAnalysisDetails;
