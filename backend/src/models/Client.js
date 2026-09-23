const mongoose = require('mongoose');

const clientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: { type: String, default: '' },
  website: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Client', clientSchema);
