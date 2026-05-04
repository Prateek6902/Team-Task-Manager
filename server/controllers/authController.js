const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

exports.register = async (req, res) => {
  const user = await User.create(req.body);
  const token = generateToken(user._id);
  res.json({ token, user });
};

exports.login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');

  if (!user || !(await user.comparePassword(req.body.password))) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken(user._id);
  res.json({ token, user });
};

exports.getMe = async (req, res) => {
  res.json({ user: req.user });
};

exports.logout = async (req, res) => {
  res.json({ message: 'Logged out' });
};

exports.updateDetails = async (req, res) => {
  const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true });
  res.json({ user });
};

exports.updatePassword = async (req, res) => {
  const user = await User.findById(req.user.id).select('+password');

  const match = await user.comparePassword(req.body.currentPassword);
  if (!match) return res.status(400).json({ message: 'Wrong password' });

  user.password = req.body.newPassword;
  await user.save();

  res.json({ message: 'Password updated' });
};
