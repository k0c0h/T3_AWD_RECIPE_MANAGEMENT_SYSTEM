const express = require('express');
const router = express.Router();
const recipeCrudController = require('../../controllers/recipeCrudController');
const upload = require('../../middleware/upload');
const authorizeRoles = require('../../middleware/authorizeRoles');

// GET - Ambos roles pueden ver
router.get('/recipes', recipeCrudController.getAllActiveRecipes);
router.get('/recipes/:id', recipeCrudController.getRecipeById);

// POST, PUT, DELETE - Solo chef

router.put(
  '/recipe/:id',
  authorizeRoles('chef'),
  upload.single('image'), 
  recipeCrudController.updateRecipe
);

router.delete('/recipe/:id', authorizeRoles('chef'), recipeCrudController.deactivateRecipe);
router.delete('/recipe/:id/force', authorizeRoles('chef'), recipeCrudController.deleteRecipePermanently);

router.patch('/recipe/:id/restore', authorizeRoles('chef'), recipeCrudController.restoreRecipe);

module.exports = router;
