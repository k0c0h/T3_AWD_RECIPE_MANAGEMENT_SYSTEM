const express = require('express');
const router = express.Router();
const Quotation = require('../../models/quotation');

// POST - Crear solicitud de cliente (CRUD - crear)
// Nota: Usar POST /quotations/client-request/estimate para estimar costo sin guardar
router.post('/quotations/client-request', async (req, res) => {
    try {
        const { clientInfo, eventInfo, budgetRange, estimatedCost } = req.body;
        
        if (!clientInfo || !eventInfo) {
            return res.status(400).json({ 
                message: 'clientInfo and eventInfo are required' 
            });
        }
        
        const quotation = new Quotation({
            quotationType: 'client_request',
            status: 'pending',
            clientInfo,
            eventInfo,
            budgetRange,
            estimatedCost
        });
        
        await quotation.save();
        res.status(201).json(quotation);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating client request', 
            error: error.message 
        });
    }
});

// POST - Crear cotización de chef (CRUD - crear)
// Nota: Usar POST /quotations/chef-calculate para calcular sin guardar
router.post('/quotations/chef-quotation', async (req, res) => {
    try {
        const { 
            clientInfo,
            eventInfo,
            recipes,
            discount = {},
            subtotal = 0,
            discountAmount = 0,
            taxes = {},
            totalAmount = 0,
            chefId
        } = req.body;
        
        if (!clientInfo || !eventInfo || !recipes || recipes.length === 0) {
            return res.status(400).json({ 
                message: 'clientInfo, eventInfo and recipes are required' 
            });
        }
        
        const quotation = new Quotation({
            quotationType: 'chef_quotation',
            status: 'pending',
            clientInfo,
            eventInfo,
            recipes,
            discount,
            subtotal,
            discountAmount,
            taxes,
            totalAmount,
            chefId
        });
        
        await quotation.save();
        res.status(201).json(quotation);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating chef quotation', 
            error: error.message 
        });
    }
});

// POST - Crear quotation genérica (CRUD - crear)
router.post('/quotations', async (req, res) => {
    try {
        const document = new Quotation(req.body);
        await document.save();
        res.status(201).json(document);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating quotation', 
            error: error.message 
        });
    }
});

router.get('/quotations', async (req, res) => {
    try {
        const { quotationType, status } = req.query;
        const filter = {};
        
        if (quotationType) filter.quotationType = quotationType;
        if (status) filter.status = status;
        
        const documents = await Quotation.find(filter).sort({ createdAt: -1 });
        res.json(documents);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching quotations', 
            error: error.message 
        });
    }
});

router.get('/quotations/:id', async (req, res) => {
    try {
        const document = await Quotation.findById(req.params.id);
        if (!document) return res.status(404).json({ message: 'Quotation not found' });
        
        res.json(document);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching quotation', 
            error: error.message 
        });
    }
});

router.put('/quotations/:id', async (req, res) => {
    try {
        const document = await Quotation.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        
        if (!document) return res.status(404).json({ message: 'Quotation not found' });
        
        res.json(document);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating quotation', 
            error: error.message 
        });
    }
});

// PATCH - Actualizar solo estado (CRUD - actualizar)
// Nota: Para aprobar Y crear evento automático, usar PATCH /quotations/:id/approve-and-schedule (Business)
router.patch('/quotations/:id/status', async (req, res) => {
    try {
        const { status } = req.body;

        if (!['pending', 'approved', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        const quotation = await Quotation.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );

        if (!quotation) return res.status(404).json({ message: 'Quotation not found' });

        res.json(quotation);

    } catch (error) {
        res.status(500).json({
            message: 'Error updating quotation status',
            error: error.message
        });
    }
});

router.delete('/quotations/:id', async (req, res) => {
    try {
        const document = await Quotation.findByIdAndDelete(req.params.id);
        if (!document) return res.status(404).json({ message: 'Quotation not found' });
        
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ 
            message: 'Error deleting quotation', 
            error: error.message 
        });
    }
});

module.exports = router;