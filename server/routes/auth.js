const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  logout,
  updateDetails,
  updatePassword
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');

// Public
router.post('/register', register);
router.post('/login', login);

// Protected
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;
