const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    kn: { type: String, default: '' },
  },
  slug: { type: String, required: true, unique: true },
  description: {
    en: { type: String, default: '' },
    kn: { type: String, default: '' },
  },
  shortDescription: {
    en: { type: String, default: '' },
    kn: { type: String, default: '' },
  },
  icon: { type: String, default: '' },
  mainImage: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

serviceSchema.pre('save', function (next) {
  if (!this.slug && this.name.en) {
    this.slug = this.name.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('Service', serviceSchema);
