const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

exports.register = async (req, res) => {
  const user = await User.create(req.body);
  const token = generateToken(user._id);

  res.json({
    success: true,
    data: { token, user }
  });
};

exports.login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email }).select('+password');

  if (!user || !(await user.comparePassword(req.body.password))) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = generateToken(user._id);

  res.json({
    success: true,
    data: { token, user }
  });
};

exports.getMe = async (req, res) => {
  res.json({
    success: true,
    data: req.user
  });
};
