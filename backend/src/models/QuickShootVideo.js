const mongoose = require('mongoose');

const quickShootVideoSchema = new mongoose.Schema({
  quickShoot: { type: mongoose.Schema.Types.ObjectId, ref: 'QuickShoot', required: true },
  title: { type: String, required: true },
  videoFile: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('QuickShootVideo', quickShootVideoSchema);
