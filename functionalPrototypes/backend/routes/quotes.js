const express = require('express');
const router = express.Router();
const Quote = require('../models/Quote');
const Client = require('../models/Client');

// GET - Obtener todas las cotizaciones
router.get('/', async (req, res) => {
  try {
    const quotes = await Quote.find()
      .populate('client')
      .sort({ createdAt: -1 });
    res.json(quotes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET - Obtener una cotización por ID
router.get('/:id', async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id)
      .populate('client');
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
  try {
    console.log('📥 RAW REQUEST BODY:', JSON.stringify(req.body, null, 2));
    
    const { number, clientId, eventInfo, items, pricing, total, date, status } = req.body;

    // Validaciones básicas
    if (!number) {
      return res.status(400).json({ message: 'Quote number is required' });
    }
    if (!clientId) {
      return res.status(400).json({ message: 'Client ID is required' });
    }

    // Verificar si el cliente existe
    const clientExists = await Client.findById(clientId);
    if (!clientExists) {
      return res.status(404).json({ message: 'Cliente no encontrado' });
    }

    // Validar eventInfo
    if (!eventInfo || typeof eventInfo !== 'object') {
      return res.status(400).json({ message: 'eventInfo is required and must be an object' });
    }
    if (!eventInfo.numberOfPeople || !eventInfo.eventDate) {
      return res.status(400).json({ message: 'eventInfo must contain numberOfPeople and eventDate' });
    }

    // Validar items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'items array is required and must not be empty' });
    }

    // Validar cada item (recipeId es opcional)
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item.recipeName || !item.type || item.servings === undefined || item.pricePerServing === undefined || item.subtotal === undefined) {
        return res.status(400).json({ 
          message: `Item ${i} is missing required fields. Required: recipeName, type, servings, pricePerServing, subtotal` 
        });
      }
      // si viene recipeId, dejamos que sea enviado (no obligatorio)
    }

    // Validar pricing
    if (!pricing || typeof pricing !== 'object') {
      return res.status(400).json({ message: 'pricing is required and must be an object' });
    }
    if (pricing.subtotal === undefined || pricing.taxAmount === undefined || pricing.total === undefined) {
      return res.status(400).json({ message: 'pricing must contain subtotal, taxAmount, and total' });
    }

    // Crear objeto de cotización SIN recipeId
    const quoteData = {
      number: number,
      client: clientId,
      eventInfo: {
        numberOfPeople: Number(eventInfo.numberOfPeople),
        eventDate: new Date(eventInfo.eventDate)
      },
      items: items.map(item => ({
        recipeId: item.recipeId || null,
        recipeName: String(item.recipeName),
        type: String(item.type),
        servings: Number(item.servings),
        pricePerServing: Number(item.pricePerServing),
        subtotal: Number(item.subtotal)
      })),
      pricing: {
        subtotal: Number(pricing.subtotal),
        discountPercentage: Number(pricing.discountPercentage || 0),
        discountAmount: Number(pricing.discountAmount || 0),
        taxPercentage: Number(pricing.taxPercentage || 15),
        taxAmount: Number(pricing.taxAmount),
        total: Number(pricing.total)
      },
      total: Number(total || pricing.total),
      date: date ? new Date(date) : new Date(),
      status: status || 'pending'
    };

    console.log('💾 QUOTE DATA TO SAVE:', JSON.stringify(quoteData, null, 2));

    const quote = new Quote(quoteData);
    const newQuote = await quote.save();
    
    console.log('✅ Quote saved successfully:', newQuote._id);
    
    // Popular solo el cliente
    const populatedQuote = await Quote.findById(newQuote._id)
      .populate('client');
      
    res.status(201).json(populatedQuote);
  } catch (err) {
    console.error('❌ Error creating quote:', err);
    res.status(400).json({ message: err.message, error: err.toString() });
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
    if (req.body.clientId != null) {
      const client = await Client.findById(req.body.clientId);
      if (!client) {
        return res.status(404).json({ message: 'Cliente no encontrado' });
      }
      quote.client = req.body.clientId;
    }
    if (req.body.eventInfo != null) quote.eventInfo = req.body.eventInfo;
    if (req.body.items != null) quote.items = req.body.items;
    if (req.body.pricing != null) {
      quote.pricing = req.body.pricing;
      quote.total = req.body.pricing.total;
    }
    if (req.body.date != null) quote.date = req.body.date;
    if (req.body.status != null) quote.status = req.body.status;

    const updatedQuote = await quote.save();
    const populatedQuote = await Quote.findById(updatedQuote._id)
      .populate('client');
    res.json(populatedQuote);
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