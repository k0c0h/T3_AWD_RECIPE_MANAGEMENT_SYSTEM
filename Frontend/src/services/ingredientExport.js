import jsPDF from "jspdf";
import * as XLSX from "xlsx";

/**
 * Servicio de exportación de ingredientes
 * Maneja la lógica de generación de PDFs y Excel
 */

const ingredientExportService = {
  /**
   * Exporta ingredientes a PDF
   * @param {Array} ingredients - Lista de ingredientes filtrados
   * @param {Object} options - Opciones de exportación (categorías, proveedores)
   */
  exportToPDF: (ingredients, options = {}) => {
    const doc = new jsPDF();
    const { selectedCategories = [], selectedSuppliers = [] } = options;

    // Filtrar ingredientes según opciones
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

    // Título
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("INVENTARIO DE INGREDIENTES", 105, 20, { align: "center" });
    
    // Fecha
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const date = new Date().toLocaleDateString("es-ES");
    doc.text(`Fecha: ${date}`, 20, 30);
    
    // Filtros aplicados
    let yPos = 40;
    if (selectedCategories.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Categorías:", 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(selectedCategories.join(", "), 50, yPos);
      yPos += 6;
    }
    if (selectedSuppliers.length > 0) {
      doc.setFont("helvetica", "bold");
      doc.text("Proveedores:", 20, yPos);
      doc.setFont("helvetica", "normal");
      doc.text(selectedSuppliers.join(", "), 50, yPos);
      yPos += 6;
    }
    
    yPos += 5;
    
    // Encabezados de tabla
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.text("Código", 20, yPos);
    doc.text("Nombre", 45, yPos);
    doc.text("Categoría", 95, yPos);
    doc.text("Marca", 130, yPos);
    doc.text("Precio", 165, yPos);
    doc.text("Proveedor", 185, yPos);
    
    yPos += 5;
    doc.setFont("helvetica", "normal");
    
    // Datos
    filteredIngredients.forEach((ing, index) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
        // Repetir encabezados
        doc.setFont("helvetica", "bold");
        doc.text("Código", 20, yPos);
        doc.text("Nombre", 45, yPos);
        doc.text("Categoría", 95, yPos);
        doc.text("Marca", 130, yPos);
        doc.text("Precio", 165, yPos);
        doc.text("Proveedor", 185, yPos);
        yPos += 5;
        doc.setFont("helvetica", "normal");
      }
      
      doc.text(ing.productId || "", 20, yPos);
      doc.text((ing.name || "").substring(0, 20), 45, yPos);
      doc.text((ing.category || "").substring(0, 15), 95, yPos);
      doc.text((ing.brand || "").substring(0, 12), 130, yPos);
      doc.text(`$${(ing.price || 0).toFixed(2)}`, 165, yPos);
      doc.text((ing.supplier || "").substring(0, 12), 185, yPos);
      
      yPos += 5;
    });
    
    // Total
    yPos += 5;
    const totalValue = filteredIngredients.reduce((sum, ing) => sum + (ing.price || 0), 0);
    doc.setFont("helvetica", "bold");
    doc.text(`Total de productos: ${filteredIngredients.length}`, 20, yPos);
    yPos += 5;
    doc.text(`Valor total del inventario: $${totalValue.toFixed(2)}`, 20, yPos);
    
    // Guardar
    const fileName = `ingredientes_${new Date().toISOString().split("T")[0]}.pdf`;
    doc.save(fileName);
  },

  /**
   * Exporta ingredientes a Excel
   * @param {Array} ingredients - Lista de ingredientes filtrados
   * @param {Object} options - Opciones de exportación (categorías, proveedores)
   */
  exportToExcel: (ingredients, options = {}) => {
    const { selectedCategories = [], selectedSuppliers = [] } = options;

    // Filtrar ingredientes según opciones
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

    // Preparar datos para Excel
    const excelData = filteredIngredients.map(ing => ({
      "Código": ing.productId || "",
      "Nombre": ing.name || "",
      "Producto": ing.product || "",
      "Categoría": ing.category || "",
      "Marca": ing.brand || "",
      "Tamaño": `${ing.size || 0} ${ing.sizeUnit || ""}`,
      "Precio": ing.price || 0,
      "Proveedor": ing.supplier || "",
      "Estado": ing.isActive !== false ? "Activo" : "Archivado"
    }));

    // Agregar fila de totales
    const totalValue = filteredIngredients.reduce((sum, ing) => sum + (ing.price || 0), 0);
    excelData.push({});
    excelData.push({
      "Código": "TOTAL",
      "Nombre": `${filteredIngredients.length} productos`,
      "Producto": "",
      "Categoría": "",
      "Marca": "",
      "Tamaño": "",
      "Precio": totalValue,
      "Proveedor": "",
      "Estado": ""
    });

    // Crear workbook y worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Ajustar ancho de columnas
    ws['!cols'] = [
      { wch: 12 }, // Código
      { wch: 25 }, // Nombre
      { wch: 20 }, // Producto
      { wch: 20 }, // Categoría
      { wch: 15 }, // Marca
      { wch: 15 }, // Tamaño
      { wch: 12 }, // Precio
      { wch: 20 }, // Proveedor
      { wch: 10 }  // Estado
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Ingredientes");

    // Guardar archivo
    const fileName = `ingredientes_${new Date().toISOString().split("T")[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }
};

export default ingredientExportService;
