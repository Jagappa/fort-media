const mongoose = require('mongoose');

const quickShootSchema = new mongoose.Schema({
  name: {
    en: { type: String, required: true },
    kn: { type: String, default: '' },
  },
  slug: { type: String, unique: true },
  description: {
    en: { type: String, default: '' },
    kn: { type: String, default: '' },
  },
  image: { type: String, default: '' },
  icon: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

quickShootSchema.pre('save', function (next) {
  if (!this.slug && this.name.en) {
    this.slug = this.name.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('QuickShoot', quickShootSchema);
