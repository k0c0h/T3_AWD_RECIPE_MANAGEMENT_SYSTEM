const express = require('express');
const router = express.Router();
const Ingredient = require('../models/Ingredient');

// GET - Obtener todos los ingredientes
router.get('/', async (req, res) => {
  try {
    // Modificado: primero busca con isActive, si no hay resultados busca todos
    let ingredients = await Ingredient.find({ isActive: true });
    
    // Si no hay ingredientes activos, devuelve todos (para compatibilidad con datos existentes)
    if (ingredients.length === 0) {
      ingredients = await Ingredient.find({});
    }
    
    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - Buscar ingredientes por nombre (para autocomplete)
router.get('/search', async (req, res) => {
  try {
    const searchTerm = req.query.name;
    const ingredients = await Ingredient.find({
      name: { $regex: searchTerm, $options: 'i' },
      isActive: true
    });
    res.json(ingredients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - Obtener un ingrediente por productId
router.get('/:productId', async (req, res) => {
  try {
    const ingredient = await Ingredient.findOne({ productId: req.params.productId });
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingrediente no encontrado' });
    }
    res.json(ingredient);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - Crear nuevo ingrediente
router.post('/', async (req, res) => {
  const ingredient = new Ingredient({
    productId: req.body.productId,
    name: req.body.name,
    category: req.body.category,
    product: req.body.product,
    brand: req.body.brand,
    size: req.body.size,
    sizeUnit: req.body.sizeUnit,
    price: req.body.price,
    availableUnits: req.body.availableUnits,
    supplier: req.body.supplier,
    supplierContact: req.body.supplierContact,
    notes: req.body.notes,
    isActive: true // Asegurar que nuevos ingredientes tengan isActive
  });

  try {
    const newIngredient = await ingredient.save();
    res.status(201).json(newIngredient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT - Actualizar ingrediente
router.put('/:productId', async (req, res) => {
  try {
    const ingredient = await Ingredient.findOne({ productId: req.params.productId });
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingrediente no encontrado' });
    }

    if (req.body.name != null) ingredient.name = req.body.name;
    if (req.body.category != null) ingredient.category = req.body.category;
    if (req.body.product != null) ingredient.product = req.body.product;
    if (req.body.brand != null) ingredient.brand = req.body.brand;
    if (req.body.size != null) ingredient.size = req.body.size;
    if (req.body.sizeUnit != null) ingredient.sizeUnit = req.body.sizeUnit;
    if (req.body.price != null) ingredient.price = req.body.price;
    if (req.body.availableUnits != null) ingredient.availableUnits = req.body.availableUnits;
    if (req.body.supplier != null) ingredient.supplier = req.body.supplier;
    if (req.body.supplierContact != null) ingredient.supplierContact = req.body.supplierContact;
    if (req.body.isActive != null) ingredient.isActive = req.body.isActive;
    if (req.body.notes != null) ingredient.notes = req.body.notes;

    ingredient.lastUpdated = Date.now();

    const updatedIngredient = await ingredient.save();
    res.json(updatedIngredient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE - Eliminar ingrediente (soft delete)
router.delete('/:productId', async (req, res) => {
  try {
    const ingredient = await Ingredient.findOne({ productId: req.params.productId });
    if (!ingredient) {
      return res.status(404).json({ message: 'Ingrediente no encontrado' });
    }

    ingredient.isActive = false;
    await ingredient.save();
    res.json({ message: 'Ingrediente desactivado correctamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;