const mongoose = require('mongoose');

const projectPartnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  business: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  logo: { type: String, default: '' },
  partnerType: { type: String, default: 'general' },
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  isActive: { type: Boolean, default: false },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('ProjectPartner', projectPartnerSchema);
