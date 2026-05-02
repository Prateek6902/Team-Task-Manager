const express = require('express');
const router = express.Router();
const {
  getDashboardData,
  getProjectStats
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/auth');

// All routes require authentication
router.use(protect);

router.get('/', getDashboardData);
router.get('/project/:projectId', getProjectStats);

module.exports = router;