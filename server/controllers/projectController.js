const Project = require('../models/Project');
const Task = require('../models/Task');

exports.createProject = async (req, res) => {
  try {
    const project = await Project.create({
      ...req.body,
      createdBy: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });
    
    res.status(201).json({ success: true, project });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { createdBy: req.user._id },
        { 'members.user': req.user._id }
      ]
    })
    .populate('members.user', 'name email avatar')
    .populate('createdBy', 'name email')
    .sort('-createdAt');
    
    res.json({ success: true, projects });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('members.user', 'name email avatar')
      .populate('createdBy', 'name email');
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    // Delete all tasks associated with this project
    await Task.deleteMany({ project: req.params.id });
    
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.addMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    
    const { userId, role } = req.body;
    
    // Check if member already exists
    const existingMember = project.members.find(m => m.user.toString() === userId);
    if (existingMember) {
      return res.status(400).json({ message: 'Member already exists' });
    }
    
    project.members.push({ user: userId, role: role || 'member' });
    await project.save();
    
    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const { userId } = req.params;

    // Remove member
    project.members = project.members.filter(
      (member) => member.user.toString() !== userId
    );

    await project.save();

    res.json({ success: true, project });
  } catch (error) {
    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};
