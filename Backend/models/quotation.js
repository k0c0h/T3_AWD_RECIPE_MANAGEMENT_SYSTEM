const mongoose = require('mongoose');

const quotationSchema = new mongoose.Schema({
    quotationType: { 
        type: String, 
        enum: ['client_request', 'chef_quotation'], 
        required: true 
    },
    status: { 
        type: String, 
        enum: ['pending', 'approved', 'completed', 'cancelled'], 
        default: 'pending' 
    },
    clientInfo: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true }
    },
    eventInfo: {
        eventType: { 
            type: String, 
            enum: ['wedding', 'corporate_event', 'birthday_party', 'other'],
            required: true 
        },
        numberOfGuests: { type: Number, required: true },
        eventDate: { type: Date, required: true },
        eventTime: { type: String, required: true },
        location: {
            address: { type: String, required: true },
            venueName: { type: String }
        },
        specialRequirements: { type: String },
        dietaryRestrictions: { type: String },
        preferredCuisine: { type: String },
        additionalNotes: { type: String }
    },
    budgetRange: {
        min: { type: Number },
        max: { type: Number }
    },
    estimatedCost: { type: Number },
    recipes: [
        {
            recipeId: { type: String },
            recipeName: { type: String },
            servings: { type: Number },
            lines: [
                {
                    productId: { type: String },
                    name: { type: String },
                    quantity: { type: Number },
                    unit: { type: String },
                    unitCost: { type: Number },
                    totalCost: { type: Number }
                }
            ],
            ingredientsCost: { type: Number },
            indirectCost: { type: Number },
            totalCost: { type: Number },
            costPerServing: { type: Number }
        }
    ],
    discount: {
        type: { type: String, enum: ['percentage', 'fixed'], default: 'percentage' },
        value: { type: Number, default: 0 }
    },
    subtotal: { type: Number },
    discountAmount: { type: Number },
    taxes: {
        ivaPercent: { type: Number, default: 0 },
        servicePercent: { type: Number, default: 0 },
        otherPercent: { type: Number, default: 0 },
        ivaAmount: { type: Number, default: 0 },
        serviceAmount: { type: Number, default: 0 },
        otherAmount: { type: Number, default: 0 },
        totalTaxes: { type: Number, default: 0 }
    },
    totalAmount: { type: Number },
    chefId: { type: String }
}, {
    collection: 'quotations',
    timestamps: true
});

module.exports = mongoose.model('Quotation', quotationSchema);