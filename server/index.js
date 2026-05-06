const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

dotenv.config();

const app = express();

// CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? false 
    : (process.env.CLIENT_URL || 'http://localhost:3000'),
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ MODELS ============

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  department: { type: String, enum: ['Development', 'Testing', 'Marketing', 'Design', 'HR', 'Management', 'Sales', 'Support'], default: 'Development' },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  designation: { type: String, default: '' },
  skills: [String],
  employeeId: { type: String, unique: true, sparse: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, default: '' },
  department: { type: String, enum: ['Development', 'Testing', 'Marketing', 'Design', 'HR', 'Management', 'Sales', 'Support'] },
  teamLead: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['lead', 'senior', 'member', 'junior'], default: 'member' },
    joinedAt: { type: Date, default: Date.now }
  }],
  projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Team = mongoose.model('Team', teamSchema);

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'member'], default: 'member' }
  }],
  visibility: { type: String, enum: ['team', 'organization', 'private'], default: 'team' },
  status: { type: String, enum: ['planning', 'active', 'on-hold', 'completed', 'archived'], default: 'planning' },
  tags: [String],
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  startDate: { type: Date },
  endDate: { type: Date },
  taskCount: {
    total: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    inProgress: { type: Number, default: 0 },
    review: { type: Number, default: 0 },
    todo: { type: Number, default: 0 }
  }
}, { timestamps: true });

projectSchema.methods.updateProgress = async function() {
  const tasks = await Task.find({ project: this._id });
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'done').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const review = tasks.filter(t => t.status === 'review').length;
  const todo = tasks.filter(t => t.status === 'todo').length;
  this.taskCount = { total, completed, inProgress, review, todo };
  if (total > 0) {
    const weightedSum = (completed * 100) + (review * 75) + (inProgress * 50) + (todo * 0);
    this.progress = Math.round(weightedSum / total);
  } else {
    this.progress = 0;
  }
  this.status = this.progress === 100 ? 'completed' : this.progress > 0 ? 'active' : this.status;
  await this.save();
  return this;
};

const Project = mongoose.model('Project', projectSchema);

const taskSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Task title is required'], trim: true },
  description: { type: String, default: '' },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['todo', 'in-progress', 'review', 'done'], default: 'todo' },
  priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
  dueDate: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  completedAt: { type: Date }
}, { timestamps: true });

taskSchema.post('save', async function() {
  if (this.project) {
    try {
      const project = await Project.findById(this.project);
      if (project) await project.updateProgress();
    } catch (error) { console.error('Error updating progress:', error); }
  }
});

const Task = mongoose.model('Task', taskSchema);

// ============ MIDDLEWARE ============

const authMiddleware = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) return res.status(401).json({ success: false, message: 'Not authorized' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'my-secret-key-123');
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ success: false, message: 'User not found' });
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

// ============ AUTH ROUTES ============

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, department, designation, employeeId } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email and password' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'User already exists' });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    const user = await User.create({
      name, email, password: hashedPassword,
      role: role || 'member',
      department: department || 'Development',
      designation: designation || '',
      employeeId: employeeId || ''
    });

    if (role === 'admin' && department) {
      const existingTeam = await Team.findOne({ name: department });
      if (!existingTeam) {
        await Team.create({
          name: department, department: department,
          teamLead: user._id, createdBy: user._id,
          members: [{ user: user._id, role: 'lead' }]
        });
      }
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'my-secret-key-123', { expiresIn: '30d' });
    res.status(201).json({
      success: true, token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, designation: user.designation, avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
    user.lastLogin = new Date();
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'my-secret-key-123', { expiresIn: '30d' });
    res.json({
      success: true, token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, avatar: user.avatar }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json({ success: true, data: user });
});

app.put('/api/auth/updatedetails', authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, email }, { new: true, runValidators: true }).select('-password');
    res.json({ success: true, data: user });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.put('/api/auth/updatepassword', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.json({ success: true, message: 'Password updated' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ============ USER ROUTES ============

app.get('/api/users', authMiddleware, async (req, res) => {
  const users = await User.find().select('-password');
  res.json({ success: true, count: users.length, data: users });
});

app.delete('/api/users/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, message: 'User deleted' });
});

app.put('/api/users/:id', authMiddleware, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });
  const { password, ...updateData } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).select('-password');
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  res.json({ success: true, data: user });
});

// ============ TEAM ROUTES ============

app.post('/api/teams', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Only admins can create teams' });
    const { name, description, department, teamLeadId } = req.body;
    const team = await Team.create({ name, description, department, teamLead: teamLeadId, createdBy: req.user._id, members: teamLeadId ? [{ user: teamLeadId, role: 'lead' }] : [] });
    if (teamLeadId) await User.findByIdAndUpdate(teamLeadId, { team: team._id });
    const populated = await Team.findById(team._id).populate('teamLead', 'name email').populate('members.user', 'name email department');
    res.status(201).json({ success: true, data: populated });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.get('/api/teams', authMiddleware, async (req, res) => {
  try {
    let teams;
    if (req.user.role === 'admin') {
      teams = await Team.find().populate('teamLead', 'name email').populate('members.user', 'name email department').populate('projects', 'name progress');
    } else {
      const userTeam = await Team.findOne({ 'members.user': req.user._id }).populate('teamLead', 'name email').populate('members.user', 'name email department').populate('projects', 'name progress');
      teams = userTeam ? [userTeam] : [];
    }
    res.json({ success: true, count: teams.length, data: teams });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.get('/api/teams/:id', authMiddleware, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id).populate('teamLead', 'name email department').populate('members.user', 'name email department designation').populate('projects', 'name progress status');
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    const isMember = team.members.some(m => m.user._id.toString() === req.user._id.toString());
    if (!isMember && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Not authorized' });
    res.json({ success: true, data: team });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.post('/api/teams/:id/members', authMiddleware, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    const isAdmin = req.user.role === 'admin';
    const isTeamLead = team.teamLead?.toString() === req.user._id.toString();
    if (!isAdmin && !isTeamLead) return res.status(403).json({ success: false, message: 'Not authorized' });
    const { userId, role } = req.body;
    if (team.members.some(m => m.user.toString() === userId)) return res.status(400).json({ success: false, message: 'User already in team' });
    team.members.push({ user: userId, role: role || 'member' });
    await team.save();
    await User.findByIdAndUpdate(userId, { team: team._id });
    const updated = await Team.findById(team._id).populate('members.user', 'name email department designation');
    res.json({ success: true, data: updated });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.delete('/api/teams/:id/members/:userId', authMiddleware, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    const isAdmin = req.user.role === 'admin';
    const isTeamLead = team.teamLead?.toString() === req.user._id.toString();
    if (!isAdmin && !isTeamLead) return res.status(403).json({ success: false, message: 'Not authorized' });
    team.members = team.members.filter(m => m.user.toString() !== req.params.userId);
    await team.save();
    await User.findByIdAndUpdate(req.params.userId, { team: null });
    const updated = await Team.findById(team._id).populate('members.user', 'name email');
    res.json({ success: true, data: updated });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.delete('/api/teams/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Only admins can delete teams' });
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
    await User.updateMany({ team: team._id }, { team: null });
    await Team.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Team deleted' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ============ PROJECT ROUTES ============

app.post('/api/projects', authMiddleware, async (req, res) => {
  try {
    const { name, description, tags, teamId } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Project name is required' });
    const projectData = {
      name, description: description || '', tags: tags || [],
      createdBy: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    };
    if (teamId) {
      projectData.team = teamId;
      await Team.findByIdAndUpdate(teamId, { $addToSet: { projects: projectData._id } });
    }
    const project = await Project.create(projectData);
    await project.updateProgress();
    const populated = await Project.findById(project._id).populate('createdBy', 'name email').populate('members.user', 'name email').populate('team', 'name department');
    res.status(201).json({ success: true, data: populated });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.get('/api/projects', authMiddleware, async (req, res) => {
  try {
    const query = {};
    if (req.user.role !== 'admin') {
      const userTeam = await Team.findOne({ 'members.user': req.user._id });
      if (userTeam) {
        query.$or = [{ team: userTeam._id }, { createdBy: req.user._id }, { 'members.user': req.user._id }, { visibility: 'organization' }];
      } else {
        query.$or = [{ createdBy: req.user._id }, { 'members.user': req.user._id }];
      }
    }
    if (req.query.search) {
      query.$and = query.$and || [];
      query.$and.push({ $or: [{ name: { $regex: req.query.search, $options: 'i' } }, { description: { $regex: req.query.search, $options: 'i' } }] });
    }
    if (req.query.status) query.status = req.query.status;
    const projects = await Project.find(query).populate('createdBy', 'name email').populate('members.user', 'name email').populate('team', 'name department').sort('-createdAt');
    for (let project of projects) await project.updateProgress();
    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.get('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('createdBy', 'name email avatar').populate('members.user', 'name email avatar').populate('team', 'name department');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    await project.updateProgress();
    res.json({ success: true, data: project });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.put('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description, tags, status } = req.body;
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (tags) updateData.tags = tags;
    if (status) updateData.status = status;
    const project = await Project.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('createdBy', 'name email').populate('members.user', 'name email');
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: project });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.delete('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });
    await Task.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Project deleted' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ============ TASK ROUTES ============

app.post('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const { title, description, project, assignedTo, dueDate, priority, status } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Task title is required' });
    const taskData = {
      title: title.trim(), description: description || '', createdBy: req.user._id,
      status: status || 'todo', priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };
    if (project && mongoose.Types.ObjectId.isValid(project)) taskData.project = project;
    if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) taskData.assignedTo = assignedTo;
    const task = await Task.create(taskData);
    const populated = await Task.findById(task._id).populate('assignedTo', 'name email').populate('project', 'name').populate('createdBy', 'name email');
    res.status(201).json({ success: true, data: populated });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.get('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const query = {};
    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;
    if (req.query.project) query.project = req.query.project;
    if (req.query.search) query.$or = [{ title: { $regex: req.query.search, $options: 'i' } }, { description: { $regex: req.query.search, $options: 'i' } }];
    const tasks = await Task.find(query).populate('assignedTo', 'name email').populate('project', 'name').populate('createdBy', 'name email').sort('-createdAt');
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.get('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignedTo', 'name email').populate('project', 'name').populate('createdBy', 'name email');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    res.json({ success: true, data: task });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, project, assignedTo, dueDate, priority, status } = req.body;
    const updateData = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (project) updateData.project = project;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (dueDate) updateData.dueDate = new Date(dueDate);
    if (priority) updateData.priority = priority;
    if (status) { updateData.status = status; updateData.completedAt = status === 'done' ? new Date() : null; }
    const task = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true }).populate('assignedTo', 'name email').populate('project', 'name').populate('createdBy', 'name email');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (task.project) { const project = await Project.findById(task.project); if (project) await project.updateProgress(); }
    res.json({ success: true, data: task });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    const projectId = task.project;
    await Task.findByIdAndDelete(req.params.id);
    if (projectId) { const project = await Project.findById(projectId); if (project) await project.updateProgress(); }
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.patch('/api/tasks/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['todo', 'in-progress', 'review', 'done'].includes(status)) return res.status(400).json({ success: false, message: 'Invalid status' });
    const updateData = { status, completedAt: status === 'done' ? new Date() : null };
    const task = await Task.findByIdAndUpdate(req.params.id, updateData, { new: true }).populate('assignedTo', 'name email').populate('project', 'name').populate('createdBy', 'name email');
    if (!task) return res.status(404).json({ success: false, message: 'Task not found' });
    if (task.project) { const project = await Project.findById(task.project); if (project) await project.updateProgress(); }
    res.json({ success: true, data: task });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

// ============ DASHBOARD ============

app.get('/api/dashboard', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    const isAdmin = req.user.role === 'admin';
    const userTeam = await Team.findOne({ 'members.user': userId }).populate('members.user', 'name email department designation');
    
    const projectQuery = isAdmin ? {} : { $or: [{ team: userTeam?._id }, { createdBy: userId }, { 'members.user': userId }] };
    const projects = await Project.find(projectQuery);
    const projectIds = projects.map(p => p._id);
    
    const taskQuery = isAdmin ? {} : { $or: [{ assignedTo: userId }, { project: { $in: projectIds } }] };
    const tasks = await Task.find(taskQuery);
    const today = new Date(); today.setHours(0, 0, 0, 0);
    
    const stats = {
      totalProjects: projects.length,
      activeProjects: projects.filter(p => p.status === 'active').length,
      completedProjects: projects.filter(p => p.status === 'completed').length,
      totalTasks: tasks.length,
      completedTasks: tasks.filter(t => t.status === 'done').length,
      inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
      todoTasks: tasks.filter(t => t.status === 'todo').length,
      reviewTasks: tasks.filter(t => t.status === 'review').length,
      overdueTasks: tasks.filter(t => new Date(t.dueDate) < today && t.status !== 'done').length,
      dueTodayTasks: tasks.filter(t => new Date(t.dueDate).toDateString() === today.toDateString() && t.status !== 'done').length,
      highPriorityTasks: tasks.filter(t => ['high', 'urgent'].includes(t.priority) && t.status !== 'done').length,
      productivity: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0
    };
    
    let teamStats = [];
    if (userTeam) {
      teamStats = await Promise.all(userTeam.members.map(async (member) => {
        const memberTasks = await Task.find({ assignedTo: member.user._id, project: { $in: projectIds } });
        const completed = memberTasks.filter(t => t.status === 'done').length;
        return { user: member.user, totalTasks: memberTasks.length, completedTasks: completed, completionRate: memberTasks.length > 0 ? Math.round((completed / memberTasks.length) * 100) : 0, role: member.role };
      }));
    }
    
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(); date.setDate(date.getDate() - i); date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date); nextDate.setDate(nextDate.getDate() + 1);
      const dayTasks = tasks.filter(t => { const created = new Date(t.createdAt); return created >= date && created < nextDate; });
      const completedDayTasks = tasks.filter(t => { const completed = t.completedAt ? new Date(t.completedAt) : null; return completed && completed >= date && completed < nextDate; });
      weeklyData.push({ date: date.toLocaleDateString('en-US', { weekday: 'short' }), created: dayTasks.length, completed: completedDayTasks.length, overdue: dayTasks.filter(t => new Date(t.dueDate) < date && t.status !== 'done').length });
    }
    
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(); date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      const monthTasks = tasks.filter(t => { const created = new Date(t.createdAt); return created >= monthStart && created <= monthEnd; });
      monthlyData.push({ month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }), total: monthTasks.length, completed: monthTasks.filter(t => t.status === 'done').length });
    }
    
    const recentTasks = await Task.find(taskQuery).populate('assignedTo', 'name email').populate('project', 'name').sort('-updatedAt').limit(10);
    
    res.json({
      success: true,
      data: {
        stats, recentTasks, weeklyData, monthlyData, teamStats,
        tasksByStatus: [
          { name: 'To Do', value: stats.todoTasks, color: '#6C63FF' },
          { name: 'In Progress', value: stats.inProgressTasks, color: '#FFA726' },
          { name: 'Review', value: stats.reviewTasks, color: '#29B6F6' },
          { name: 'Done', value: stats.completedTasks, color: '#66BB6A' }
        ],
        tasksByPriority: [
          { name: 'Critical', value: tasks.filter(t => t.priority === 'urgent').length, color: '#D32F2F' },
          { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: '#EF5350' },
          { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#FFA726' },
          { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: '#66BB6A' }
        ],
        projectStatusData: [
          { name: 'Planning', value: projects.filter(p => p.status === 'planning').length, color: '#6C63FF' },
          { name: 'Active', value: projects.filter(p => p.status === 'active').length, color: '#4CAF50' },
          { name: 'On Hold', value: projects.filter(p => p.status === 'on-hold').length, color: '#FFA726' },
          { name: 'Completed', value: projects.filter(p => p.status === 'completed').length, color: '#66BB6A' }
        ],
        totalTeams: isAdmin ? await Team.countDocuments() : 1,
        totalMembers: userTeam ? userTeam.members.length : 0
      }
    });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running', timestamp: new Date().toISOString() });
});

// Production setup
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  app.get('*', (req, res) => { res.sendFile(path.resolve(__dirname, '../client/build', 'index.html')); });
}

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, message: 'Server Error' });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanager';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB error:', err.message);
    process.exit(1);
  });
