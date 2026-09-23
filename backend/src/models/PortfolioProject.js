const mongoose = require('mongoose');

const portfolioProjectSchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    kn: { type: String, default: '' },
  },
  slug: { type: String, unique: true },
  client: { type: String, default: '' },
  category: { type: String, required: true },
  description: {
    en: { type: String, default: '' },
    kn: { type: String, default: '' },
  },
  coverImage: { type: String, default: '' },
  images: [{ type: String }],
  videos: [{
    url: String,
    title: { en: String, kn: String },
    thumbnail: String,
  }],
  projectDate: { type: Date },
  isFeatured: { type: Boolean, default: false },
  isPublished: { type: Boolean, default: false },
  displayOrder: { type: Number, default: 0 },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service' },
}, { timestamps: true });

portfolioProjectSchema.pre('save', function (next) {
  if (!this.slug && this.title.en) {
    this.slug = this.title.en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
  next();
});

module.exports = mongoose.model('PortfolioProject', portfolioProjectSchema);
