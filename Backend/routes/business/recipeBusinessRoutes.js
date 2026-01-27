const express = require('express');
const router = express.Router();
const recipeBusinessController = require('../../controllers/recipeBusinessController');
const authorizeRoles = require('../../middleware/authorizeRoles');
const authenticateToken = require('../../middleware/auth');
const upload = require('../../middleware/upload');

// POST - Solo chef
//router.post('/recipe', authorizeRoles('chef'), recipeBusinessController.createRecipe);
router.post(
  '/recipe',
  authenticateToken,
  authorizeRoles('chef'),
  upload.single('image'),
  recipeBusinessController.createRecipe
);

// GET - Ambos roles
router.get('/recipes/category/:category', recipeBusinessController.getRecipesByCategory);
router.get('/recipes/name/:name', recipeBusinessController.getRecipeByName);

module.exports = router;
