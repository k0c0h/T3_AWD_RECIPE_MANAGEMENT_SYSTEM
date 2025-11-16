const mongoose = require('mongoose');

// Define sub-schemas para mejor control
const eventInfoSchema = new mongoose.Schema({
  numberOfPeople: {
    type: Number,
    required: [true, 'Number of people is required'],
    min: [1, 'Number of people must be at least 1']
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date is required']
  }
}, { _id: false });

// Item schema SIN referencia a Recipe - guarda snapshot de datos
const itemSchema = new mongoose.Schema({
  recipeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  },
  recipeName: {
    type: String,
    required: [true, 'Recipe name is required']
  },
  type: {
    type: String,
    required: [true, 'Recipe type is required']
  },
  servings: {
    type: Number,
    required: [true, 'Servings is required'],
    min: [1, 'Servings must be at least 1']
  },
  pricePerServing: {
    type: Number,
    required: [true, 'Price per serving is required'],
    min: [0, 'Price per serving cannot be negative']
  },
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  }
}, { _id: false });

const pricingSchema = new mongoose.Schema({
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  discountPercentage: {
    type: Number,
    default: 0,
    min: [0, 'Discount percentage cannot be negative'],
    max: [100, 'Discount percentage cannot exceed 100']
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: [0, 'Discount amount cannot be negative']
  },
  taxPercentage: {
    type: Number,
    default: 15,
    min: [0, 'Tax percentage cannot be negative']
  },
  taxAmount: {
    type: Number,
    required: [true, 'Tax amount is required'],
    min: [0, 'Tax amount cannot be negative']
  },
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: [0, 'Total cannot be negative']
  }
}, { _id: false });

const quoteSchema = new mongoose.Schema({
  number: {
    type: String,
    required: [true, 'Quote number is required'],
    unique: true,
    trim: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: [true, 'Client is required']
  },
  eventInfo: {
    type: eventInfoSchema,
    required: [true, 'Event information is required']
  },
  items: {
    type: [itemSchema],
    required: [true, 'Items are required'],
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'At least one item is required'
    }
  },
  pricing: {
    type: pricingSchema,
    required: [true, 'Pricing information is required']
  },
  total: {
    type: Number,
    required: [true, 'Total is required'],
    min: [0, 'Total cannot be negative']
  },
  date: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'approved', 'rejected'],
      message: 'Status must be pending, approved, or rejected'
    },
    default: 'pending'
  }
}, {
  timestamps: true
});

// Middleware para sincronizar pricing.total con total
quoteSchema.pre('save', function(next) {
  if (this.pricing && this.pricing.total !== undefined) {
    this.total = this.pricing.total;
  } else if (!this.total && this.pricing) {
    const subtotal = this.pricing.subtotal || 0;
    const taxAmount = this.pricing.taxAmount || 0;
    const discountAmount = this.pricing.discountAmount || 0;
    this.total = subtotal - discountAmount + taxAmount;
    if (this.pricing) {
      this.pricing.total = this.total;
    }
  }
  next();
});

module.exports = mongoose.model('Quote', quoteSchema);