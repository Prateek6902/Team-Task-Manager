const Task = require('../models/Task');

exports.createTask = async (req, res) => {
  try {
    console.log("BODY:", req.body);
    console.log("USER:", req.user);

    const task = await Task.create({
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
      status: req.body.status,
      dueDate: req.body.dueDate,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: task
    });

  } catch (error) {
    console.error("CREATE TASK ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find();

    res.status(200).json({
      success: true,
      data: tasks
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    res.status(200).json({
      success: true,
      data: task
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: task
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Task deleted'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
