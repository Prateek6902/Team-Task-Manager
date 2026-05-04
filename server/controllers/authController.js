const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const user = await User.create(req.body);
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: { token, user }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= LOGIN =================
exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select('+password');

    if (!user || !(await user.comparePassword(req.body.password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: { token, user }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET ME =================
exports.getMe = async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
};

// ================= LOGOUT =================
exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out'
  });
};

// ================= UPDATE DETAILS =================
exports.updateDetails = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= UPDATE PASSWORD =================
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    const match = await user.comparePassword(req.body.currentPassword);
    if (!match) {
      return res.status(400).json({ success: false, message: 'Wrong password' });
    }

    user.password = req.body.newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password updated'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
