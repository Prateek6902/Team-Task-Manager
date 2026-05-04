const express = require('express');
const router = express.Router();

// ================= CONTROLLERS =================
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

// ================= MIDDLEWARE =================
const { protect, authorize } = require('../middleware/auth');

// ================= ROUTES =================

// All routes require login
router.use(protect);

// ================= USER ROUTES =================

// Get all users (allow all logged-in users)
router.get('/', getUsers);

// Get single user
router.get('/:id', getUser);

// Update user (only admin)
router.put('/:id', authorize('admin'), updateUser);

// Delete user (only admin)
router.delete('/:id', authorize('admin'), deleteUser);


// ================= EXPORT =================
module.exports = router;
