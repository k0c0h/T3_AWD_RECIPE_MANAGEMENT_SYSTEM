const express = require('express');
const router = express.Router();
const recipeBusinessController = require('../../controllers/recipeBusinessController');
const recipeCrudController = require('../../controllers/recipeCrudController');
const authorizeRoles = require('../../middleware/authorizeRoles');
const authenticateToken = require('../../middleware/auth');
const upload = require('../../middleware/upload');

router.post(
  '/recipe',
  authenticateToken,
  authorizeRoles('chef'),
  upload.single('image'),
  recipeBusinessController.createRecipe
);

router.put(
  '/recipe/:id/with-calculations',
  authenticateToken,
  authorizeRoles('chef'),
  upload.single('image'),
  recipeCrudController.updateRecipeWithCalculations
);

router.get('/recipes/category/:category', recipeBusinessController.getRecipesByCategory);

router.get('/recipes/name/:name', recipeBusinessController.getRecipeByName);

module.exports = router;
