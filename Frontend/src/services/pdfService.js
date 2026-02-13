import jsPDF from "jspdf";
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

const formatCurrency = (value, currency = "$", decimals = 2) => {
  const numberValue = Number(value || 0);
  return `${currency}${numberValue.toFixed(decimals)}`;
};

const formatDate = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const drawHeader = (doc) => {
  doc.setFillColor(159, 185, 179); 
  doc.rect(0, 0, 210, 35, "F");
  
  doc.setFillColor(231, 199, 138); 
  doc.rect(0, 32, 210, 3, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("DishDash", 20, 18);

  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Rosi Cañarte", 20, 26);

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("COTIZACIÓN", 210 - 20, 22, { align: "right" });
};


const drawFooter = (doc, pageNumber) => {
  const pageHeight = doc.internal.pageSize.height;

  doc.setDrawColor(229, 223, 216); 
  doc.setLineWidth(0.5);
  doc.line(20, pageHeight - 20, 190, pageHeight - 20);

  doc.setTextColor(156, 163, 175); 
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text("DishDash - Experiencias culinarias personalizadas", 105, pageHeight - 12, { align: "center" });
  doc.setFont("helvetica", "normal");
  doc.text(`Página ${pageNumber}`, 190, pageHeight - 12, { align: "right" });
};

const drawSection = (doc, title, yPos) => {
  doc.setFillColor(245, 242, 235); 
  doc.rect(20, yPos - 5, 170, 8, "F");
  
  doc.setTextColor(55, 65, 81); 
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(title, 22, yPos);
  
  return yPos + 8;
};

const drawField = (doc, label, value, x, y, align = "left") => {
  doc.setFontSize(9);
  doc.setTextColor(107, 114, 128); 
  doc.setFont("helvetica", "normal");
  doc.text(label, x, y);
  
  doc.setTextColor(55, 65, 81);
  doc.setFont("helvetica", "bold");
  const valueText = String(value || "");
  if (align === "right") {
    doc.text(valueText, x + 80, y, { align: "right" });
  } else {
    doc.text(valueText, x + 35, y);
  }
};

export const generateQuotationPDF = (quotation) => {
  const doc = new jsPDF();
  let currentPage = 1;
  
  drawHeader(doc);
  
  let yPos = 45;

  yPos = drawSection(doc, "INFORMACIÓN DEL CLIENTE", yPos);
  yPos += 5;
  
  drawField(doc, "Nombre:", quotation.clientInfo?.name || "", 25, yPos);
  yPos += 6;
  drawField(doc, "Teléfono:", quotation.clientInfo?.phone || "", 25, yPos);
  yPos += 6;
  drawField(doc, "Email:", quotation.clientInfo?.email || "", 25, yPos);
  yPos += 12;

  yPos = drawSection(doc, "DETALLES DEL EVENTO", yPos);
  yPos += 5;
  
  drawField(doc, "Tipo de evento:", quotation.eventInfo?.eventType || "", 25, yPos);
  yPos += 6;
  drawField(doc, "Número de invitados:", quotation.eventInfo?.numberOfGuests || 0, 25, yPos);
  yPos += 6;
  const fullDate = `${formatDate(quotation.eventInfo?.eventDate)} - ${quotation.eventInfo?.eventTime || ""}`;
  drawField(doc, "Fecha y hora:", fullDate, 25, yPos);
  yPos += 6;
  drawField(doc, "Lugar:", quotation.eventInfo?.location?.venueName || "", 25, yPos);
  yPos += 6;
  drawField(doc, "Dirección:", quotation.eventInfo?.location?.address || "", 25, yPos);
  yPos += 12;

  yPos = drawSection(doc, "RECETAS SELECCIONADAS", yPos);
  yPos += 5;
  
  quotation.recipes?.forEach((recipe, index) => {
    if (yPos > 250) {
      drawFooter(doc, currentPage);
      doc.addPage();
      currentPage++;
      drawHeader(doc);
      yPos = 45;
    }

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(229, 223, 216);
    doc.setLineWidth(0.3);
    doc.roundedRect(25, yPos - 3, 160, 8, 2, 2, "FD");
    
    doc.setTextColor(55, 65, 81);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(`${index + 1}. ${recipe.recipeName}`, 27, yPos + 2);
    
    doc.setTextColor(47, 111, 92); 
    doc.text(formatCurrency(recipe.totalCost), 183, yPos + 2, { align: "right" });
    yPos += 10;
 
    doc.setTextColor(107, 114, 128);
    doc.setFontSize(8);
    doc.setFont("helvetica", "italic");
    doc.text(`${recipe.servings} porciones · ${formatCurrency(recipe.costPerServing)} por porción`, 27, yPos);
    yPos += 5;

    if (recipe.lines && recipe.lines.length > 0) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      recipe.lines.forEach((line) => {
        if (yPos > 270) {
          drawFooter(doc, currentPage);
          doc.addPage();
          currentPage++;
          drawHeader(doc);
          yPos = 45;
        }
        doc.setTextColor(107, 114, 128);
        doc.text(`• ${line.name}: ${line.quantity} ${line.unit}`, 30, yPos);
        yPos += 4;
      });
    }
    yPos += 3;
  });
  
  yPos += 5;

  if (yPos > 230) {
    drawFooter(doc, currentPage);
    doc.addPage();
    currentPage++;
    drawHeader(doc);
    yPos = 45;
  }

  yPos = drawSection(doc, "RESUMEN FINANCIERO", yPos);
  yPos += 8;

  doc.setFillColor(245, 242, 235);
  doc.roundedRect(25, yPos - 5, 160, 35, 2, 2, "F");

  doc.setTextColor(107, 114, 128);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Subtotal:", 30, yPos);
  doc.setTextColor(55, 65, 81);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(quotation.subtotal), 180, yPos, { align: "right" });
  yPos += 7;

  doc.setTextColor(107, 114, 128);
  doc.setFont("helvetica", "normal");
  doc.text("Descuento:", 30, yPos);
  doc.setTextColor(55, 65, 81);
  doc.setFont("helvetica", "bold");
  doc.text(`-${formatCurrency(quotation.discountAmount)}`, 180, yPos, { align: "right" });
  yPos += 7;

  doc.setTextColor(107, 114, 128);
  doc.setFont("helvetica", "normal");
  doc.text("Impuestos:", 30, yPos);
  doc.setTextColor(55, 65, 81);
  doc.setFont("helvetica", "bold");
  doc.text(formatCurrency(quotation.taxes?.totalTaxes), 180, yPos, { align: "right" });
  yPos += 10;

  doc.setDrawColor(231, 199, 138); 
  doc.setLineWidth(0.8);
  doc.line(30, yPos, 180, yPos);
  yPos += 7;
  
  doc.setTextColor(47, 111, 92); 
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", 30, yPos);
  doc.text(formatCurrency(quotation.totalAmount), 180, yPos, { align: "right" });

  drawFooter(doc, currentPage);

  const fileName = `Cotizacion_DishDash_${quotation.clientInfo?.name?.replace(/\s+/g, '_') || 'Cliente'}_${new Date().toISOString().split('T')[0]}.pdf`;

  doc.save(fileName);
  
  return fileName;
};

export default {
  generateQuotationPDF
};