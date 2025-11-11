const express = require('express');
const router = express.Router();
const Client = require('../models/Client');

// Obtener todos los clientes
router.get('/', async (req, res) => {
  try {
    const clients = await Client.find();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Crear nuevo cliente
router.post('/', async (req, res) => {
  const client = new Client({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    address: req.body.address
  });

  try {
    const newClient = await client.save();
    res.status(201).json(newClient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
