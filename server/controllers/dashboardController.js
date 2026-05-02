const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

exports.getDashboardData = async (req, res) => {
  try {
    // Get user's projects
    const userProjects = await Project.find({
      $or: [
        { createdBy: req.user._id },
        { 'members.user': req.user._id }
      ]
    });
    
    const projectIds = userProjects.map(p => p._id);
    
    // Get tasks statistics
    const tasks = await Task.find({
      $or: [
        { assignedTo: req.user._id },
        { project: { $in: projectIds } }
      ]
    });
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'done').length;
    const overdueTasks = tasks.filter(t => 
      new Date(t.dueDate) < new Date() && t.status !== 'done'
    ).length;
    
    // Team members count (unique members from all projects)
    const teamMembers = new Set();
    userProjects.forEach(project => {
      teamMembers.add(project.createdBy.toString());
      project.members.forEach(member => {
        teamMembers.add(member.user.toString());
      });
    });
    
    // Recent tasks
    const recentTasks = await Task.find({
      $or: [
        { assignedTo: req.user._id },
        { project: { $in: projectIds } }
      ]
    })
    .populate('assignedTo', 'name email')
    .sort('-createdAt')
    .limit(10);
    
    // Chart data (tasks created per day for last 7 days)
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = await Task.countDocuments({
        createdAt: { $gte: date, $lt: nextDate },
        $or: [
          { assignedTo: req.user._id },
          { project: { $in: projectIds } }
        ]
      });
      
      chartData.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        tasks: count
      });
    }
    
    const stats = {
      totalProjects: userProjects.length,
      totalTasks,
      completedTasks,
      overdueTasks,
      teamMembers: teamMembers.size,
      productivity: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    };
    
    res.json({
      success: true,
      stats,
      recentTasks,
      chartData
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};