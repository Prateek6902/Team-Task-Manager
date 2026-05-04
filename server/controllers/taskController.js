const Task = require('../models/Task');

// ================= CREATE =================
exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      createdBy: req.user._id
    });

    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= GET ALL =================
exports.getTasks = async (req, res) => {
  const tasks = await Task.find();
  res.json({ success: true, data: tasks });
};

// ================= GET ONE =================
exports.getTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  res.json({ success: true, data: task });
};

// ================= UPDATE =================
exports.updateTask = async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: task });
};

// ================= DELETE =================
exports.deleteTask = async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Deleted' });
};

// ================= UPDATE STATUS (IMPORTANT FIX) =================
exports.updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= ADD COMMENT =================
exports.addComment = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    task.comments.push({
      user: req.user._id,
      text: req.body.text
    });

    await task.save();

    res.json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
