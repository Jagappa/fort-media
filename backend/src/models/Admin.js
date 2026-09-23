const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, enum: ['superadmin', 'admin', 'editor', 'partner'], default: 'admin' },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  resetToken: String,
  resetTokenExpiry: Date,
}, { timestamps: true });

adminSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

adminSchema.methods.createResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.resetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.resetTokenExpiry = Date.now() + 30 * 60 * 1000; // 30 minutes
  return token;
};

adminSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetToken;
  delete obj.resetTokenExpiry;
  return obj;
};

module.exports = mongoose.model('Admin', adminSchema);
