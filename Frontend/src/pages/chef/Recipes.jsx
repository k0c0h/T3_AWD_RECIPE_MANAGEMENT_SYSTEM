import React, { useEffect, useState } from "react";
import recipeService from "../../services/recipe";

import RecipeFilters from "../../views/recipes/RecipeFilters";
import RecipeExports from "../../views/recipes/RecipeExports";
import RecipesGrid from "../../views/recipes/RecipesGrid";
import RecipeModal from "../../views/recipes/RecipeModal";
import RecipeDetailModal from "../../views/recipes/RecipeDetailModal";
import jsPDF from "jspdf";

import Toast from "../../components/ui/Toast";

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [minServings, setMinServings] = useState(0);
  const [maxTime, setMaxTime] = useState(0);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [detail, setDetail] = useState(null);

  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const data = await recipeService.getAll();
      setRecipes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      showToast("Error al cargar recetas", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let data = [...recipes];

    if (category) {
      data = data.filter((r) => r.category === category);
    }

    if (search.trim().length >= 2) {
      const s = search.toLowerCase();
      data = data.filter((r) => r.name?.toLowerCase().includes(s));
    }

    if (minServings > 0) {
      data = data.filter((r) => r.servings >= minServings);
    }

    if (maxTime > 0) {
      data = data.filter((r) => r.prepTime <= maxTime);
    }

    setFiltered(data);
  }, [recipes, search, category, minServings, maxTime]);

  const handleSave = async (formData) => {
    try {
      if (editing) {
        await recipeService.update(editing._id, formData);
        showToast("Receta actualizada");
      } else {
        const created = await recipeService.create(formData);
        
        // El backend-CRUD ya calcula los costos automáticamente
        // Si el cálculo falló, el backend lo registra pero la receta se crea igual
        if (created?.calculationError) {
          console.warn("Advertencia: Receta creada pero el cálculo de costos falló:", created.calculationError);
          showToast("Receta creada (sin costos calculados)", "warn");
        } else {
          showToast("Receta creada exitosamente");
        }
      }

      setModalOpen(false);
      setEditing(null);
      loadRecipes();
    } catch (err) {
      console.error(err);
      showToast("Error al guardar receta", "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await recipeService.remove(id);
      setRecipes((prev) => prev.filter((r) => r._id !== id));
      showToast("Receta eliminada");
    } catch {
      showToast("Error al eliminar receta", "error");
    }
  };

  const handleExport = (type) => {
    if (filtered.length === 0) {
      showToast("No hay recetas para exportar", "error");
      return;
    }

    if (type === "csv") {
      const headers = ["Nombre", "Categoría", "Porciones", "Descripción"];
      const rows = filtered.map((r) => [
        r.name,
        r.category,
        r.servings,
        r.description?.replace(/[\n\r]/g, " ") || "",
      ]);

      let csv = "data:text/csv;charset=utf-8,";
      csv += headers.join(",") + "\n";
      rows.forEach((row) => {
        csv += row.map((f) => `"${f}"`).join(",") + "\n";
      });

      const link = document.createElement("a");
      link.href = encodeURI(csv);
      link.download = "recetas_exportadas.csv";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    if (type === "pdf") {
      const doc = new jsPDF("p", "mm", "a4");
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 14;
      let y = 30;

      const COLORS = {
        primary: "#9FB9B3",
        accent: "#e7c78a",
        text: "#333333",
        background: "#f5f2eb",
      };

      const logoDataUrl = "data:image/png;base64,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"; // o ruta, si usas jsPDF's addImage()

      const addHeader = () => {
        doc.setFillColor(COLORS.accent);
        doc.rect(0, 0, pageWidth, 20, "F");
        if (logoDataUrl) {
          doc.addImage(logoDataUrl, "PNG", margin, 3, 14, 14);
        }
        doc.setFontSize(16);
        doc.setTextColor(COLORS.primary);
        doc.setFont("helvetica", "bold");
        doc.text("Recetas Exportadas", margin + 20, 14);
        doc.setDrawColor(COLORS.primary);
        doc.setLineWidth(0.5);
        y = 30;
      };

      addHeader();

      const colWidths = {
        index: 10,
        name: 70,
        category: 35,
        servings: 25,
        description: pageWidth - margin * 2 - 10 - 70 - 35 - 25, // resto
      };

      doc.setFontSize(12);
      doc.setTextColor(COLORS.text);
      doc.setFont("helvetica", "bold");

      doc.text("#", margin, y);
      doc.text("Nombre", margin + colWidths.index, y);
      doc.text("Categoría", margin + colWidths.index + colWidths.name, y);
      doc.text(
        "Porciones",
        margin + colWidths.index + colWidths.name + colWidths.category,
        y,
      );
      doc.text(
        "Descripción",
        margin +
          colWidths.index +
          colWidths.name +
          colWidths.category +
          colWidths.servings,
        y,
      );

      y += 8;
      doc.setFont("helvetica", "normal");

      filtered.forEach((r, i) => {
        if (y > 270) {
          doc.addPage();
          addHeader();
          doc.setFontSize(12);
          doc.setFont("helvetica", "bold");
          doc.text("#", margin, y);
          doc.text("Nombre", margin + colWidths.index, y);
          doc.text("Categoría", margin + colWidths.index + colWidths.name, y);
          doc.text(
            "Porciones",
            margin + colWidths.index + colWidths.name + colWidths.category,
            y,
          );
          doc.text(
            "Descripción",
            margin +
              colWidths.index +
              colWidths.name +
              colWidths.category +
              colWidths.servings,
            y,
          );
          y += 8;
          doc.setFont("helvetica", "normal");
        }

        const description = r.description?.replace(/[\n\r]/g, " ") || "";

        doc.text(String(i + 1), margin, y);
        doc.text(r.name, margin + colWidths.index, y);
        doc.text(r.category, margin + colWidths.index + colWidths.name, y);
        doc.text(
          String(r.servings),
          margin + colWidths.index + colWidths.name + colWidths.category,
          y,
        );

        const splitDescription = doc.splitTextToSize(
          description,
          colWidths.description,
        );
        doc.text(
          splitDescription,
          margin +
            colWidths.index +
            colWidths.name +
            colWidths.category +
            colWidths.servings,
          y,
        );

        y += splitDescription.length * 6 + 2;
      });

      doc.save("recetas_exportadas.pdf");
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ id: Date.now(), message, type });
  };

  /* ===================== RENDER ===================== */
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-12 w-12 border-b-2"
          style={{ borderColor: "#9FB9B3" }}
        />
      </div>
    );
  }

  return (
    <>
      {/* solo botón nueva receta */}
      <RecipeFilters
        search={search}
        onSearch={setSearch}
        category={category}
        onCategory={setCategory}
        onNew={() => setModalOpen(true)}
        onExport={handleExport}
      />

      <RecipesGrid
        recipes={filtered}
        onEdit={(r) => {
          setEditing(r);
          setModalOpen(true);
        }}
        onView={setDetail}
        onDelete={handleDelete}
      />

      <RecipeModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSave}
        initialData={editing}
      />

      <RecipeDetailModal recipe={detail} onClose={() => setDetail(null)} />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
};

export default Recipes;
