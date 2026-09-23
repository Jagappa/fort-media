const crypto = require('crypto');
const Admin = require('../models/Admin');
const { generateToken } = require('../middleware/auth');
const { sendPasswordReset, sendPartnerCredentials } = require('../utils/email');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    if (!admin.isActive) {
      return res.status(403).json({ message: 'Account is deactivated' });
    }
    admin.lastLogin = new Date();
    await admin.save();
    res.json({ admin: admin.toJSON(), token: generateToken(admin._id) });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });
    const admin = await Admin.create({ name, email, password });
    res.status(201).json({ admin: admin.toJSON(), token: generateToken(admin._id) });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getProfile = async (req, res) => { res.json(req.admin); };

exports.updateProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id);
    if (req.body.name) admin.name = req.body.name;
    if (req.body.email) admin.email = req.body.email;
    if (req.body.password) admin.password = req.body.password;
    await admin.save();
    res.json(admin.toJSON());
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ─── FORGOT PASSWORD ───
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Please provide your email address.' });
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(404).json({ message: 'No account found with that email.' });
    const resetToken = admin.createResetToken();
    await admin.save();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/admin/reset-password/${resetToken}`;
    await sendPasswordReset(admin.email, admin.name, resetUrl);
    res.json({ message: 'Password reset link has been sent to your email.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
  }
};

// ─── RESET PASSWORD ───
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    if (!password || password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const admin = await Admin.findOne({ resetToken: hashedToken, resetTokenExpiry: { $gt: Date.now() } });
    if (!admin) return res.status(400).json({ message: 'Invalid or expired reset token.' });
    admin.password = password;
    admin.resetToken = undefined;
    admin.resetTokenExpiry = undefined;
    await admin.save();
    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

// ─── CREATE PARTNER (with email) ───
exports.createPartner = async (req, res) => {
  try {
    const { name, email, phone, business } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email are required.' });
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered.' });
    // Generate random password
    const password = 'FM' + crypto.randomBytes(4).toString('hex').toUpperCase();
    const partner = await Admin.create({ name, email, password, role: 'partner', isActive: true });
    // Send email with credentials
    try {
      await sendPartnerCredentials(email, name, password);
    } catch (emailErr) {
      console.error('Email send failed:', emailErr.message);
    }
    res.status(201).json({ partner: partner.toJSON(), generatedPassword: password, message: 'Partner created. Login credentials sent to email.' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.getPartnerAccounts = async (req, res) => {
  try {
    const partners = await Admin.find({ role: 'partner' }).select('-password').sort('-createdAt');
    res.json(partners);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.updatePartnerAccount = async (req, res) => {
  try {
    const update = {};
    if (req.body.name) update.name = req.body.name;
    if (req.body.isActive !== undefined) update.isActive = req.body.isActive === 'true' || req.body.isActive === true;
    const partner = await Admin.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    res.json(partner);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

exports.deletePartnerAccount = async (req, res) => {
  try {
    const partner = await Admin.findById(req.params.id);
    if (partner?.role === 'superadmin') return res.status(403).json({ message: 'Cannot delete superadmin.' });
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: 'Partner account deleted.' });
  } catch (error) { res.status(500).json({ message: error.message }); }
};
