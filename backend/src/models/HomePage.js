const mongoose = require('mongoose');

const homePageSchema = new mongoose.Schema({
  videoUrl: { type: String },
  videoFile: { type: String },
  videoType: { type: String, enum: ['upload', 'url'], default: 'upload' },
  thumbnail: { type: String },
  isActive: { type: Boolean, default: false },
  title: { type: String },
  description: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('HomePage', homePageSchema);
