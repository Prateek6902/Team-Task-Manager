const Project = require('../models/Project');
const Task = require('../models/Task');

exports.getDashboardData = async (req, res) => {
  const projects = await Project.find();
  const tasks = await Task.find();

  res.json({
    stats: {
      totalProjects: projects.length,
      totalTasks: tasks.length
    }
  });
};

exports.getProjectStats = async (req, res) => {
  const tasks = await Task.find({ project: req.params.projectId });

  res.json({
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length
  });
};
