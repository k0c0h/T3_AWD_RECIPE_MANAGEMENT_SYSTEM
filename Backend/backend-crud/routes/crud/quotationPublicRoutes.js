const express = require('express');
const router = express.Router();
const Quotation = require('../../models/quotation');

// POST - Crear solicitud de cliente (PÚBLICO - sin autenticación)
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

module.exports = router;
