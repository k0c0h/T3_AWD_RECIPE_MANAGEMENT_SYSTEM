const express = require('express');
const router = express.Router();
const Quote = require('../models/Quote');
const Client = require('../models/Client'); // 👈 Importamos el modelo de cliente

// ===============================
// GET - Obtener todas las cotizaciones
// ===============================
router.get('/', async (req, res) => {
  try {
    const quotes = await Quote.find()
      .populate('client') // 👈 Trae los datos del cliente asociado
      .sort({ date: -1 });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===============================
// GET - Obtener una cotización por ID
// ===============================
router.get('/:id', async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id).populate('client'); // 👈 También muestra el cliente
    if (!quote) {
      return res.status(404).json({ message: 'Cotización no encontrada' });
    }
    res.json(quote);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ===============================
// POST - Crear nueva cotización
// ===============================
router.post('/', async (req, res) => {
  try {
    const { number, clientId, date, total, status } = req.body;

    // 👇 Verificar si el cliente existe
    const client = await Client.findById(clientId);
    if (!client) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Crear nueva cotización
    const quote = new Quote({
      number,
      client: clientId, // 👈 Se guarda la referencia al cliente
      date,
      total,
      status: status || 'pending'
    });

    const newQuote = await quote.save();
    // 👇 Devolvemos la cotización con los datos completos del cliente
    const populatedQuote = await newQuote.populate('client');
    res.status(201).json(populatedQuote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ===============================
// PUT - Actualizar cotización
// ===============================
router.put('/:id', async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) {
      return res.status(404).json({ message: 'Cotización no encontrada' });
    }

    // Actualizamos solo los campos enviados
    if (req.body.number != null) quote.number = req.body.number;
    if (req.body.clientId != null) {
      const client = await Client.findById(req.body.clientId);
      if (!client) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }
      quote.client = req.body.clientId; // 👈 actualiza referencia de cliente
    }
    if (req.body.date != null) quote.date = req.body.date;
    if (req.body.total != null) quote.total = req.body.total;
    if (req.body.status != null) quote.status = req.body.status;

    const updatedQuote = await quote.save();
    const populatedQuote = await updatedQuote.populate('client');
    res.json(populatedQuote);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ===============================
// DELETE - Eliminar cotización
// ===============================
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
