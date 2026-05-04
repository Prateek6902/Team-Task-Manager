const express = require('express');
const router = express.Router();

// ================= CONTROLLERS =================
const {
  register,
  login,
  getMe,
  logout,
  updateDetails,
  updatePassword
} = require('../controllers/authController');

// ================= MIDDLEWARE =================
const { protect } = require('../middleware/auth');

// ================= PUBLIC ROUTES =================

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);


// ================= PROTECTED ROUTES =================

// Get current logged-in user
router.get('/me', protect, getMe);

// Logout user
router.post('/logout', protect, logout);

// Update user profile
router.put('/updatedetails', protect, updateDetails);

// Update password
router.put('/updatepassword', protect, updatePassword);


// ================= EXPORT =================
module.exports = router;
