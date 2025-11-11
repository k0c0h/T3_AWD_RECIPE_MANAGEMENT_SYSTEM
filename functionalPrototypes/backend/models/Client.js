const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false
  },
  phone: {
    type: String,
    required: false
  },
  address: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Client', clientSchema);
