const Project = require('../models/Project');
const Task = require('../models/Task');

exports.getDashboardData = async (req, res) => {
  try {
    const projects = await Project.find();
    const tasks = await Task.find();

    res.json({
      success: true,
      data: {
        stats: {
          totalProjects: projects.length,
          totalTasks: tasks.length
        },
        recentTasks: tasks.slice(-5),
        weeklyData: [] // optional
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getProjectStats = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId });

    res.json({
      success: true,
      data: {
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'done').length
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
