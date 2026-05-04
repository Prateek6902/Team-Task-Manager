const Project = require('../models/Project');
const Task = require('../models/Task');

// ================= CREATE =================
exports.createProject = async (req, res) => {
  try {
    const project = await Project.create({
      ...req.body,
      createdBy: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= GET ALL =================
exports.getProjects = async (req, res) => {
  const projects = await Project.find();
  res.json({ success: true, data: projects });
};

// ================= GET ONE =================
exports.getProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  res.json({ success: true, data: project });
};

// ================= UPDATE =================
exports.updateProject = async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ success: true, data: project });
};

// ================= DELETE =================
exports.deleteProject = async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  await Task.deleteMany({ project: req.params.id });

  res.json({ success: true, message: 'Deleted' });
};

// ================= ADD MEMBER (FIXED) =================
exports.addMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.members.push(req.body);

    await project.save();

    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= REMOVE MEMBER (FIXED) =================
exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    project.members = project.members.filter(
      m => m.user.toString() !== req.params.userId
    );

    await project.save();

    res.json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
