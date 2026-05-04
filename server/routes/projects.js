const express = require('express');
const router = express.Router();

const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} = require('../controllers/projectController');

const { protect, authorize } = require('../middleware/auth');

// All routes require login
router.use(protect);

// ================= ROUTES =================

// Get all projects / Create project
router.route('/')
  .get(getProjects)
  .post(createProject);

// Get / Update / Delete single project
router.route('/:id')
  .get(getProject)
  .put(authorize('admin'), updateProject)
  .delete(authorize('admin'), deleteProject);

// ================= MEMBERS =================

// Add member
router.post('/:id/members', authorize('admin'), addMember);

// Remove member
router.delete('/:id/members/:userId', authorize('admin'), removeMember);

module.exports = router;
