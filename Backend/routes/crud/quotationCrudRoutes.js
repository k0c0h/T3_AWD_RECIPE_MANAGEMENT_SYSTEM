const express = require('express');
const router = express.Router();
const Quotation = require('../../models/quotation');

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

router.patch('/quotations/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['pending', 'approved', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }
        
        const document = await Quotation.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        
        if (!document) return res.status(404).json({ message: 'Quotation not found' });
        
        res.json(document);
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