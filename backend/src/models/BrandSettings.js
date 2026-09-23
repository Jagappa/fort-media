const mongoose = require('mongoose');

const brandSettingsSchema = new mongoose.Schema({
  logo: { type: String, default: '' },
  logoLight: { type: String, default: '' },
  logoDark: { type: String, default: '' },
  favicon: { type: String, default: '' },
  brandName: { type: String, default: 'FORT MEDIA' },
  tagline: {
    en: { type: String, default: "We Don't Follow Trends. We Build Them." },
    kn: { type: String, default: '' },
  },
  primaryColor: { type: String, default: '#DC2626' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  location: { type: String, default: '' },
  instagram: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  facebook: { type: String, default: '' },
  youtube: { type: String, default: '' },
  linkedin: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('BrandSettings', brandSettingsSchema);
