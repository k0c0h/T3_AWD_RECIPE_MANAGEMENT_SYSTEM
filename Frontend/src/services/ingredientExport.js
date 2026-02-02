import jsPDF from "jspdf";
import * as XLSX from "xlsx";

const COLORS = {
  primary: "#9FB9B3",      
  primaryDark: "#2f6f5c", 
  accent: "#e7c78a",       
  accentDark: "#d4b06f",   
  background: "#f5f2eb",   
  border: "#e5dfd8",       
  text: {
    dark: "#374151",
    medium: "#6B7280",
    light: "#9CA3AF"
  }
};

const ingredientExportService = {
  exportToPDF: (ingredients, options = {}) => {
    const doc = new jsPDF();
    const { selectedCategories = [], selectedSuppliers = [] } = options;

    let filteredIngredients = ingredients;
    if (selectedCategories.length > 0) {
      filteredIngredients = filteredIngredients.filter(ing => 
        selectedCategories.includes(ing.category)
      );
    }
    if (selectedSuppliers.length > 0) {
      filteredIngredients = filteredIngredients.filter(ing => 
        selectedSuppliers.includes(ing.supplier)
      );
    }

    const pageHeight = doc.internal.pageSize.height;
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 20;
    let currentPage = 1;

    doc.setFillColor(159, 185, 179); 
    doc.rect(0, 0, pageWidth, 30, "F");
    
    doc.setFillColor(231, 199, 138); 
    doc.rect(0, 28, pageWidth, 2, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("DishDash", 14, 15);

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Rosi Cañarte", 14, 22);

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("INVENTARIO DE INGREDIENTES", pageWidth - 14, 18, { align: "right" });

    yPos = 40;
    doc.setFontSize(10);
    doc.setTextColor(COLORS.text.medium);
    doc.setFont("helvetica", "normal");
    const date = new Date().toLocaleDateString("es-ES");
    doc.text(`Fecha: ${date}`, 14, yPos);
    yPos += 8;

    if (selectedCategories.length > 0 || selectedSuppliers.length > 0) {
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(COLORS.text.dark);
      doc.text("Filtros aplicados:", 14, yPos);
      yPos += 6;

      if (selectedCategories.length > 0) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(COLORS.text.medium);
        const categoriesText = selectedCategories.join(", ");
        doc.text(`Categorías: ${categoriesText}`, 20, yPos);
        yPos += 5;
      }

      if (selectedSuppliers.length > 0) {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(COLORS.text.medium);
        const suppliersText = selectedSuppliers.join(", ");
        doc.text(`Proveedores: ${suppliersText}`, 20, yPos);
        yPos += 5;
      }

      yPos += 5;
    }

    const columns = ["Código", "Nombre", "Categoría", "Marca", "Tamaño", "Precio", "Proveedor"];
    const colWidths = [20, 40, 25, 25, 25, 25, 35];
    const rowHeight = 7;

    doc.setFillColor(159, 185, 179); 
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);

    let xPos = 14;
    columns.forEach((col, idx) => {
      doc.text(col, xPos, yPos + 5, { align: "left" });
      xPos += colWidths[idx];
    });

    yPos += rowHeight + 2;

    doc.setTextColor(COLORS.text.dark);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);

    filteredIngredients.forEach((ingredient, idx) => {
      if (yPos > pageHeight - 30) {
        doc.setDrawColor(COLORS.border);
        doc.setLineWidth(0.5);
        doc.line(14, pageHeight - 20, pageWidth - 14, pageHeight - 20);

        doc.setTextColor(COLORS.text.light);
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.text("DishDash - Experiencias culinarias personalizadas", pageWidth / 2, pageHeight - 12, { align: "center" });
        doc.setFont("helvetica", "normal");
        doc.text(`Página ${currentPage}`, pageWidth - 14, pageHeight - 12, { align: "right" });

        doc.addPage();
        currentPage++;
        yPos = 20;
        doc.setFillColor(159, 185, 179);
        doc.rect(0, 0, pageWidth, 30, "F");
        
        doc.setFillColor(231, 199, 138);
        doc.rect(0, 28, pageWidth, 2, "F");

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("INVENTARIO DE INGREDIENTES (continuación)", pageWidth / 2, 15, { align: "center" });

        yPos = 40;

        doc.setFillColor(159, 185, 179);
        doc.setTextColor(255, 255, 255);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);

        xPos = 14;
        columns.forEach((col, idx) => {
          doc.text(col, xPos, yPos + 5, { align: "left" });
          xPos += colWidths[idx];
        });

        yPos += rowHeight + 2;
        doc.setTextColor(COLORS.text.dark);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
      }

      if (idx % 2 === 0) {
        doc.setFillColor(245, 242, 235); // background
        doc.rect(14, yPos - 1, pageWidth - 28, rowHeight, "F");
      }

      const rowData = [
        ingredient.productId || "",
        ingredient.name || "",
        ingredient.category || "",
        ingredient.brand || "",
        `${ingredient.size || ""} ${ingredient.sizeUnit || ""}`,
        `$${Number(ingredient.price || 0).toFixed(2)}`,
        ingredient.supplier || ""
      ];

      xPos = 14;
      rowData.forEach((cell, idx) => {
        doc.text(String(cell), xPos, yPos + 5, { align: "left" });
        xPos += colWidths[idx];
      });

      yPos += rowHeight;
    }); // ✅ CORRECCIÓN: Paréntesis correcto aquí

    doc.setDrawColor(COLORS.border);
    doc.setLineWidth(0.5);
    doc.line(14, pageHeight - 30, pageWidth - 14, pageHeight - 30);

    const totalValue = filteredIngredients.reduce((sum, ing) => sum + (ing.price || 0), 0);
    
    doc.setTextColor(COLORS.text.dark);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text(`Total de productos: ${filteredIngredients.length}`, 14, pageHeight - 23);
    
    doc.setTextColor(COLORS.primaryDark);
    doc.setFontSize(11);
    doc.text(`Valor total del inventario: $${totalValue.toFixed(2)}`, 14, pageHeight - 16);

    doc.setDrawColor(COLORS.border);
    doc.setLineWidth(0.5);
    doc.line(14, pageHeight - 10, pageWidth - 14, pageHeight - 10);

    doc.setTextColor(COLORS.text.light);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text("DishDash - Experiencias culinarias personalizadas", pageWidth / 2, pageHeight - 5, { align: "center" });
    
    const fileName = `Inventario_Ingredientes_DishDash_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
  },

  exportToExcel: (ingredients, options = {}) => {
    const { selectedCategories = [], selectedSuppliers = [] } = options;

    let filteredIngredients = ingredients;
    if (selectedCategories.length > 0) {
      filteredIngredients = filteredIngredients.filter(ing => 
        selectedCategories.includes(ing.category)
      );
    }
    if (selectedSuppliers.length > 0) {
      filteredIngredients = filteredIngredients.filter(ing => 
        selectedSuppliers.includes(ing.supplier)
      );
    }

    const excelData = filteredIngredients.map(ing => ({
      "Código": ing.productId || "",
      "Nombre": ing.name || "",
      "Producto": ing.product || "",
      "Categoría": ing.category || "",
      "Marca": ing.brand || "",
      "Tamaño": `${ing.size || 0} ${ing.sizeUnit || ""}`,
      "Precio": `$${Number(ing.price || 0).toFixed(2)}`,
      "Proveedor": ing.supplier || "",
      "Estado": ing.isActive !== false ? "Activo" : "Archivado"
    }));

    const totalValue = filteredIngredients.reduce((sum, ing) => sum + (ing.price || 0), 0);
    excelData.push({
      "Código": "RESUMEN",
      "Nombre": `${filteredIngredients.length} productos`,
      "Producto": "",
      "Categoría": "",
      "Marca": "",
      "Tamaño": "",
      "Precio": `$${totalValue.toFixed(2)}`,
      "Proveedor": "Total inventario",
      "Estado": ""
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    ws['!cols'] = [
      { wch: 12 }, 
      { wch: 25 }, 
      { wch: 20 }, 
      { wch: 18 }, 
      { wch: 15 }, 
      { wch: 15 }, 
      { wch: 12 }, 
      { wch: 20 },
      { wch: 12 } 
    ];

    for (let i = 0; i < 9; i++) {
      const cellRef = XLSX.utils.encode_col(i) + "1";
      if (!ws[cellRef]) continue;
      ws[cellRef].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "9FB9B3" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }
    const lastRow = excelData.length;
    for (let i = 0; i < 9; i++) {
      const cellRef = XLSX.utils.encode_col(i) + lastRow;
      if (!ws[cellRef]) continue;
      ws[cellRef].s = {
        font: { bold: true, color: { rgb: "FFFFFF" } },
        fill: { fgColor: { rgb: "2F6F5C" } },
        alignment: { horizontal: "center", vertical: "center" }
      };
    }

    XLSX.utils.book_append_sheet(wb, ws, "Ingredientes");
    const fileName = `Inventario_Ingredientes_DishDash_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }
};

export default ingredientExportService;