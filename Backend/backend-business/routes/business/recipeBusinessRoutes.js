const express = require('express');
const router = express.Router();
const recipeBusinessController = require('../../controllers/recipeBusinessController');
const authorizeRoles = require('../../middleware/authorizeRoles');
const authenticateToken = require('../../middleware/auth');

router.post(
  '/recipe/:id/calculate-costs',
  authenticateToken,
  authorizeRoles('chef'),
  recipeBusinessController.calculateRecipeCosts
);

router.post(
  '/recipes/:id/calculate-costs',
  authenticateToken,
  authorizeRoles('chef'),
  recipeBusinessController.calculateRecipeCosts
);

router.put(
  '/recipe/:id/recalculate-costs',
  authenticateToken,
  authorizeRoles('chef'),
  recipeBusinessController.recalculateRecipeCosts
);

router.put(
  '/recipes/:id/recalculate-costs',
  authenticateToken,
  authorizeRoles('chef'),
  recipeBusinessController.recalculateRecipeCosts
);

router.get(
  '/recipes/category/:category',
  recipeBusinessController.getRecipesByCategory
);

router.get(
  '/recipes/name/:name',
  recipeBusinessController.getRecipeByName
);

module.exports = router;
