const express = require('express');
const router = express.Router();
const Quote = require('../models/Quote');

// GET - Obtener todas las cotizaciones
router.get('/', async (req, res) => {
  try {
    const quotes = await Quote.find().sort({ date: -1 });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - Obtener una cotización por ID
router.get('/:id', async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ message: 'Cotización no encontrada' });
    }
    res.json(quote);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST - Crear nueva cotización
router.post('/', async (req, res) => {
  const quote = new Quote({
    number: req.body.number,
    client: req.body.client,
    date: req.body.date,
    total: req.body.total,
    status: req.body.status || 'pending'
  });

  try {
    const newQuote = await quote.save();
    res.status(201).json(newQuote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT - Actualizar cotización
router.put('/:id', async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ message: 'Cotización no encontrada' });
    }

    if (req.body.number != null) quote.number = req.body.number;
    if (req.body.client != null) quote.client = req.body.client;
    if (req.body.date != null) quote.date = req.body.date;
    if (req.body.total != null) quote.total = req.body.total;
    if (req.body.status != null) quote.status = req.body.status;

    const updatedQuote = await quote.save();
    res.json(updatedQuote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE - Eliminar cotización
router.delete('/:id', async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ message: 'Cotización no encontrada' });
    }

    await quote.deleteOne();
    res.json({ message: 'Cotización eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;