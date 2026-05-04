const Task = require('../models/Task');

exports.createTask = async (req, res) => {
  const task = await Task.create({ ...req.body, createdBy: req.user._id });
  res.json({ task });
};

exports.getTasks = async (req, res) => {
  const tasks = await Task.find();
  res.json({ tasks });
};

exports.getTask = async (req, res) => {
  const task = await Task.findById(req.params.id);
  res.json({ task });
};

exports.updateTask = async (req, res) => {
  const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ task });
};

exports.deleteTask = async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
};

exports.updateTaskStatus = async (req, res) => {
  const task = await Task.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status },
    { new: true }
  );
  res.json({ task });
};

exports.addComment = async (req, res) => {
  const task = await Task.findById(req.params.id);

  task.comments.push({
    user: req.user._id,
    text: req.body.text
  });

  await task.save();
  res.json({ task });
};
