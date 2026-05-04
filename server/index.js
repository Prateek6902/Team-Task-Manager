const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://team-task-manager-gtdo.onrender.com"
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ MODELS ============

// User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Project Schema with progress tracking
const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'member'], default: 'member' }
  }],
  status: { 
    type: String, 
    enum: ['active', 'completed', 'archived'], 
    default: 'active' 
  },
  tags: [String],
  progress: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 100 
  },
  taskCount: {
    total: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    inProgress: { type: Number, default: 0 },
    review: { type: Number, default: 0 },
    todo: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Method to update progress based on tasks
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

// Task Schema
const taskSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Task title is required'],
    trim: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  project: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project',
    default: null
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    default: null
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  status: { 
    type: String, 
    enum: ['todo', 'in-progress', 'review', 'done'], 
    default: 'todo' 
  },
  priority: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'urgent'], 
    default: 'medium' 
  },
  dueDate: { 
    type: Date,
    default: function() {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date;
    }
  },
  completedAt: { type: Date }
}, { timestamps: true });

// Post-save middleware to update project progress
taskSchema.post('save', async function() {
  if (this.project) {
    try {
      const project = await Project.findById(this.project);
      if (project) {
        await project.updateProgress();
      }
    } catch (error) {
      console.error('Error updating project progress after task save:', error);
    }
  }
});

// Post-remove middleware to update project progress
taskSchema.post('findOneAndDelete', async function(doc) {
  if (doc && doc.project) {
    try {
      const project = await Project.findById(doc.project);
      if (project) {
        await project.updateProgress();
      }
    } catch (error) {
      console.error('Error updating project progress after task delete:', error);
    }
  }
});

const Task = mongoose.model('Task', taskSchema);

// ============ AUTH MIDDLEWARE ============

const authMiddleware = async (req, res, next) => {
  try {
    let token;
    
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Not authorized, no token' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'my-secret-key-123');
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ 
      success: false, 
      message: 'Not authorized' 
    });
  }
};

// ============ AUTH ROUTES ============

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Register:', req.body);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: email.includes('admin') ? 'admin' : 'member'
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'my-secret-key-123',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login:', req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || 'my-secret-key-123',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Get Current User
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// Update Details
app.put('/api/auth/updatedetails', authMiddleware, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update details error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update Password
app.put('/api/auth/updatepassword', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({
      success: true,
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============ USER ROUTES ============

// Get All Users
app.get('/api/users', authMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete User (Admin only)
app.delete('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update User (Admin only)
app.put('/api/users/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const { password, ...updateData } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============ PROJECT ROUTES ============

// Create Project
app.post('/api/projects', authMiddleware, async (req, res) => {
  try {
    console.log('Create project:', req.body);
    const { name, description, tags } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Project name is required'
      });
    }

    const project = await Project.create({
      name,
      description: description || '',
      tags: tags || [],
      createdBy: req.user._id,
      members: [{ user: req.user._id, role: 'admin' }]
    });

    // Initialize progress
    await project.updateProgress();

    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email');

    console.log('Project created:', project._id);
    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get All Projects
app.get('/api/projects', authMiddleware, async (req, res) => {
  try {
    const query = {};
    
    // Search functionality
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const projects = await Project.find(query)
      .populate('createdBy', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort('-createdAt');

    // Update progress for all projects before sending
    for (let project of projects) {
      await project.updateProgress();
    }

    res.json({
      success: true,
      count: projects.length,
      data: projects
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get Single Project
app.get('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('createdBy', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Update progress
    await project.updateProgress();

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update Project
app.put('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    const { name, description, tags, status } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (tags) updateData.tags = tags;
    if (status) updateData.status = status;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('createdBy', 'name email avatar')
    .populate('members.user', 'name email avatar');

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    res.json({
      success: true,
      data: project
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete Project
app.delete('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Delete tasks associated with this project
    await Task.deleteMany({ project: req.params.id });
    await Project.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Project and associated tasks deleted successfully'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update Project Progress Manually
app.put('/api/projects/:id/progress', authMiddleware, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    await project.updateProgress();

    const populated = await Project.findById(project._id)
      .populate('createdBy', 'name email')
      .populate('members.user', 'name email');

    res.json({
      success: true,
      data: populated
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============ TASK ROUTES ============

// Create Task
app.post('/api/tasks', authMiddleware, async (req, res) => {
  try {
    console.log('Create task request body:', req.body);

    const { title, description, project, assignedTo, dueDate, priority, status } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required'
      });
    }

    const taskData = {
      title: title.trim(),
      description: description || '',
      createdBy: req.user._id,
      status: status || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    };

    if (project && mongoose.Types.ObjectId.isValid(project)) {
      taskData.project = project;
    }

    if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
      taskData.assignedTo = assignedTo;
    }

    console.log('Creating task with data:', taskData);

    const task = await Task.create(taskData);

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .populate('createdBy', 'name email');

    console.log('Task created successfully:', task._id);

    res.status(201).json({
      success: true,
      data: populated
    });
  } catch (error) {
    console.error('Create task error details:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create task'
    });
  }
});

// Get All Tasks
app.get('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const query = {};

    if (req.query.status) query.status = req.query.status;
    if (req.query.priority) query.priority = req.query.priority;
    if (req.query.project) query.project = req.query.project;
    
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email avatar')
      .populate('project', 'name')
      .populate('createdBy', 'name email')
      .sort('-createdAt');

    res.json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get Single Task
app.get('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email avatar')
      .populate('project', 'name')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update Task
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
    if (status) {
      updateData.status = status;
      if (status === 'done') {
        updateData.completedAt = new Date();
      } else {
        updateData.completedAt = null;
      }
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('assignedTo', 'name email')
    .populate('project', 'name')
    .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Update project progress
    if (task.project) {
      const project = await Project.findById(task.project);
      if (project) {
        await project.updateProgress();
      }
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Update task error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Delete Task
app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const projectId = task.project;
    await Task.findByIdAndDelete(req.params.id);

    // Update project progress
    if (projectId) {
      const project = await Project.findById(projectId);
      if (project) {
        await project.updateProgress();
      }
    }

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Update Task Status
app.patch('/api/tasks/:id/status', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body;

    if (!['todo', 'in-progress', 'review', 'done'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const updateData = { status };
    if (status === 'done') {
      updateData.completedAt = new Date();
    } else {
      updateData.completedAt = null;
    }

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    )
    .populate('assignedTo', 'name email')
    .populate('project', 'name')
    .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Update project progress
    if (task.project) {
      const project = await Project.findById(task.project);
      if (project) {
        await project.updateProgress();
      }
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============ DASHBOARD ROUTE ============

app.get('/api/dashboard', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [
        { createdBy: req.user._id },
        { 'members.user': req.user._id }
      ]
    });

    const projectIds = projects.map(p => p._id);
    const tasks = await Task.find({
      $or: [
        { assignedTo: req.user._id },
        { project: { $in: projectIds } }
      ]
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const recentTasks = await Task.find({
      $or: [
        { assignedTo: req.user._id },
        { project: { $in: projectIds } }
      ]
    })
    .populate('assignedTo', 'name email')
    .populate('project', 'name')
    .sort('-createdAt')
    .limit(10);

    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayTasks = tasks.filter(t => {
        const created = new Date(t.createdAt);
        return created >= date && created < nextDate;
      });

      weeklyData.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        created: dayTasks.length,
        completed: dayTasks.filter(t => t.status === 'done').length
      });
    }

    res.json({
      success: true,
      data: {
        stats: {
          totalProjects: projects.length,
          totalTasks: tasks.length,
          completedTasks: tasks.filter(t => t.status === 'done').length,
          inProgressTasks: tasks.filter(t => t.status === 'in-progress').length,
          todoTasks: tasks.filter(t => t.status === 'todo').length,
          reviewTasks: tasks.filter(t => t.status === 'review').length,
          overdueTasks: tasks.filter(t => new Date(t.dueDate) < today && t.status !== 'done').length,
          highPriorityTasks: tasks.filter(t => ['high', 'urgent'].includes(t.priority) && t.status !== 'done').length,
          productivity: tasks.length > 0 ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100) : 0
        },
        recentTasks,
        weeklyData,
        tasksByStatus: [
          { name: 'To Do', value: tasks.filter(t => t.status === 'todo').length, color: '#6C63FF' },
          { name: 'In Progress', value: tasks.filter(t => t.status === 'in-progress').length, color: '#FFA726' },
          { name: 'Review', value: tasks.filter(t => t.status === 'review').length, color: '#29B6F6' },
          { name: 'Done', value: tasks.filter(t => t.status === 'done').length, color: '#66BB6A' }
        ],
        tasksByPriority: [
          { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: '#66BB6A' },
          { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#FFA726' },
          { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: '#EF5350' },
          { name: 'Urgent', value: tasks.filter(t => t.priority === 'urgent').length, color: '#D32F2F' }
        ]
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ============ HEALTH CHECK ============

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// ============ ERROR HANDLER ============

app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============ START SERVER ============

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskmanager';

console.log('Starting TaskFlow Pro Server...');
console.log('MongoDB URI:', MONGODB_URI.replace(/\/\/.*@/, '//<credentials>@'));

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`✅ Health check: http://localhost:${PORT}/api/health`);
      console.log(`📋 API endpoints available:`);
      console.log(`   POST /api/auth/register`);
      console.log(`   POST /api/auth/login`);
      console.log(`   GET  /api/auth/me`);
      console.log(`   GET  /api/projects`);
      console.log(`   POST /api/projects`);
      console.log(`   GET  /api/tasks`);
      console.log(`   POST /api/tasks`);
      console.log(`   GET  /api/dashboard`);
      console.log(`   GET  /api/users`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Starting server without database connection...');
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  });