const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
  number: {
    type: String,
    required: true,
    unique: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',  
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quote', quoteSchema);