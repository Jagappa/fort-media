const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  clientName: { type: String, required: true },
  company: { type: String, default: '' },
  profileImage: { type: String, default: '' },
  testimonial: {
    en: { type: String, required: true },
    kn: { type: String, default: '' },
  },
  rating: { type: Number, min: 1, max: 5, default: 5 },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Testimonial', testimonialSchema);
