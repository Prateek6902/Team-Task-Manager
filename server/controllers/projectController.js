const Project = require('../models/Project');
const Task = require('../models/Task');

exports.createProject = async (req, res) => {
  const project = await Project.create({
    ...req.body,
    createdBy: req.user._id,
    members: [{ user: req.user._id, role: 'admin' }]
  });
  res.json({ project });
};

exports.getProjects = async (req, res) => {
  const projects = await Project.find();
  res.json({ projects });
};

exports.getProject = async (req, res) => {
  const project = await Project.findById(req.params.id);
  res.json({ project });
};

exports.updateProject = async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json({ project });
};

exports.deleteProject = async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  await Task.deleteMany({ project: req.params.id });
  res.json({ message: 'Deleted' });
};

exports.addMember = async (req, res) => {
  const project = await Project.findById(req.params.id);
  project.members.push(req.body);
  await project.save();
  res.json({ project });
};

exports.removeMember = async (req, res) => {
  const project = await Project.findById(req.params.id);

  project.members = project.members.filter(
    m => m.user.toString() !== req.params.userId
  );

  await project.save();
  res.json({ project });
};
