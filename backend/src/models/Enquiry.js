const mongoose = require('mongoose');

const enquirySchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, default: '' },
  businessName: { type: String, default: '' },
  service: { type: String, required: true },
  shootType: { type: String, default: '' },
  budget: { type: String, default: '' },
  message: { type: String, default: '' },
  status: {
    type: String,
    enum: ['new', 'contacted', 'in-progress', 'converted', 'closed'],
    default: 'new',
  },
  notes: { type: String, default: '' },
  source: { type: String, default: 'website' },
}, { timestamps: true });

module.exports = mongoose.model('Enquiry', enquirySchema);
