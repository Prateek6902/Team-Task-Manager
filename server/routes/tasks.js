const express = require('express');
const router = express.Router();

const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
  addComment
} = require('../controllers/taskController');

const { protect } = require('../middleware/auth');

router.use(protect);

// ================= ROUTES =================

router.route('/')
  .get(getTasks)
  .post(createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(deleteTask);

// 🔥 THIS WAS CRASHING
router.patch('/:id/status', updateTaskStatus);

// Comments
router.post('/:id/comments', addComment);

module.exports = router;
