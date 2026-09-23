const mongoose = require('mongoose');

const serviceVideoSchema = new mongoose.Schema({
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  title: {
    en: { type: String, required: true },
    kn: { type: String, default: '' },
  },
  description: {
    en: { type: String, default: '' },
    kn: { type: String, default: '' },
  },
  videoUrl: { type: String, default: '' },
  videoFile: { type: String, default: '' },
  videoType: { type: String, enum: ['upload', 'url'], default: 'url' },
  thumbnail: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('ServiceVideo', serviceVideoSchema);
