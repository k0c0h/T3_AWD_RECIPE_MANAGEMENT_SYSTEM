const express = require('express');
const router = express.Router();
const recipeBusinessController = require('../../controllers/recipeBusinessController');
const authorizeRoles = require('../../middleware/authorizeRoles');
const authenticateToken = require('../../middleware/auth');
const upload = require('../../middleware/upload');

// POST - Crear receta (CRUD PURO - sin cálculos)
router.post(
  '/recipe',
  authenticateToken,
  authorizeRoles('chef'),
  upload.single('image'),
  recipeBusinessController.createRecipe
);

// POST - Calcular y actualizar costos de receta (BUSINESS LOGIC)
router.post(
  '/recipe/:id/calculate-costs',
  authenticateToken,
  authorizeRoles('chef'),
  recipeBusinessController.calculateRecipeCosts
);

// PUT - Recalcular costos cuando cambian ingredientes o servings (BUSINESS LOGIC)
router.put(
  '/recipe/:id/recalculate-costs',
  authenticateToken,
  authorizeRoles('chef'),
  recipeBusinessController.recalculateRecipeCosts
);

// GET - Buscar recetas por categoría
router.get('/recipes/category/:category', recipeBusinessController.getRecipesByCategory);

// GET - Buscar receta por nombre
router.get('/recipes/name/:name', recipeBusinessController.getRecipeByName);

module.exports = router;
