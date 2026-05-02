import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  Chip,
  LinearProgress,
  Avatar,
  AvatarGroup,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tooltip,
  ListItemAvatar,
  ListItemText
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  Assignment,
  AccessTime,
  CheckCircle,
  Warning,
  Timeline
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium',
    status: 'todo'
  });

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch project details
      const projectRes = await axios.get(`http://localhost:5000/api/projects/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const projectData = projectRes.data?.data || projectRes.data?.project || {};
      setProject(projectData);
      
      // Fetch tasks for this project
      const tasksRes = await axios.get(`http://localhost:5000/api/tasks?project=${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const tasksData = tasksRes.data?.data || tasksRes.data?.tasks || [];
      setTasks(Array.isArray(tasksData) ? tasksData : []);
    } catch (error) {
      console.error('Error fetching project:', error);
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!newTask.title) {
        toast.error('Task title is required');
        return;
      }

      const taskData = {
        title: newTask.title,
        description: newTask.description,
        project: id,
        priority: newTask.priority,
        status: newTask.status,
        dueDate: newTask.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };

      if (newTask.assignedTo) {
        taskData.assignedTo = newTask.assignedTo;
      }

      const response = await axios.post('http://localhost:5000/api/tasks', taskData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const createdTask = response.data?.data || response.data?.task || response.data;
      setTasks(prev => [createdTask, ...prev]);
      setOpenTaskDialog(false);
      setNewTask({
        title: '',
        description: '',
        assignedTo: '',
        dueDate: '',
        priority: 'medium',
        status: 'todo'
      });
      toast.success('Task created successfully! 📝');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `http://localhost:5000/api/tasks/${taskId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setTasks(prev => prev.map(task => 
        task._id === taskId ? { ...task, status: newStatus } : task
      ));
      toast.success(`Task status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update task status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/tasks/${taskId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTasks(prev => prev.filter(t => t._id !== taskId));
        toast.success('Task deleted');
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error('Failed to delete task');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'done': 'success',
      'in-progress': 'warning',
      'review': 'info',
      'todo': 'default'
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'urgent': 'error',
      'high': 'warning',
      'medium': 'info',
      'low': 'success'
    };
    return colors[priority] || 'default';
  };

  // Safe calculations with null checks
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t && t.status === 'done').length;
  const inProgressTasks = tasks.filter(t => t && t.status === 'in-progress').length;
  const overdueTasks = tasks.filter(t => {
    if (!t || !t.dueDate) return false;
    return new Date(t.dueDate) < new Date() && t.status !== 'done';
  }).length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const filteredTasks = tasks.filter(task => {
    if (!task) return false;
    if (tabValue === 0) return true;
    if (tabValue === 1) return task.status === 'todo';
    if (tabValue === 2) return task.status === 'in-progress';
    if (tabValue === 3) return task.status === 'done';
    return true;
  });

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography>Loading project...</Typography>
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <Typography variant="h6" color="error">Project not found</Typography>
        <Button onClick={() => navigate('/projects')} sx={{ mt: 2 }}>
          Back to Projects
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => navigate('/projects')}
          sx={{ mb: 2 }}
        >
          Back to Projects
        </Button>
        
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                {project?.name || 'Untitled Project'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {project?.description || 'No description'}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => setOpenTaskDialog(true)}
              >
                Add Task
              </Button>
            </Box>
          </Box>
        </motion.div>
      </Box>

      {/* Project Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    <Assignment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{totalTasks}</Typography>
                    <Typography variant="body2" color="text.secondary">Total Tasks</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.main' }}>
                    <CheckCircle />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{completedTasks}</Typography>
                    <Typography variant="body2" color="text.secondary">Completed</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.main' }}>
                    <Timeline />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{inProgressTasks}</Typography>
                    <Typography variant="body2" color="text.secondary">In Progress</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'error.main' }}>
                    <Warning />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 700 }}>{overdueTasks}</Typography>
                    <Typography variant="body2" color="text.secondary">Overdue</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Grid>
      </Grid>

      {/* Progress Bar */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Overall Progress</Typography>
            <Typography variant="h6" color="primary" sx={{ fontWeight: 600 }}>{progress}%</Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={progress}
            sx={{ 
              height: 12, 
              borderRadius: 6,
              backgroundColor: 'rgba(108, 99, 255, 0.1)',
              '& .MuiLinearProgress-bar': {
                borderRadius: 6,
                background: 'linear-gradient(90deg, #6C63FF, #FF6B6B)',
              }
            }}
          />
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardContent>
          <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ mb: 3 }}>
            <Tab label={`All (${totalTasks})`} />
            <Tab label={`To Do (${tasks.filter(t => t && t.status === 'todo').length})`} />
            <Tab label={`In Progress (${tasks.filter(t => t && t.status === 'in-progress').length})`} />
            <Tab label={`Done (${tasks.filter(t => t && t.status === 'done').length})`} />
          </Tabs>

          {filteredTasks.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">No tasks found</Typography>
            </Box>
          ) : (
            <List>
              {filteredTasks.map((task, index) => (
                <motion.div
                  key={task._id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ListItem
                    sx={{
                      mb: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      },
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <Box sx={{ width: '100%' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {task?.title || 'Untitled Task'}
                          </Typography>
                          {task?.description && (
                            <Typography variant="body2" color="text.secondary">
                              {task.description}
                            </Typography>
                          )}
                        </Box>
                        
                        <FormControl size="small" sx={{ minWidth: 130, ml: 2 }}>
                          <Select
                            value={task?.status || 'todo'}
                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                            size="small"
                          >
                            <MenuItem value="todo">To Do</MenuItem>
                            <MenuItem value="in-progress">In Progress</MenuItem>
                            <MenuItem value="review">Review</MenuItem>
                            <MenuItem value="done">Done</MenuItem>
                          </Select>
                        </FormControl>
                      </Box>
                      
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                        <Chip
                          label={task?.status || 'todo'}
                          size="small"
                          color={getStatusColor(task?.status)}
                        />
                        <Chip
                          label={task?.priority || 'medium'}
                          size="small"
                          color={getPriorityColor(task?.priority)}
                        />
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, ml: 'auto' }}>
                          <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                          <Typography variant="caption" color="text.secondary">
                            Due: {task?.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No date'}
                          </Typography>
                        </Box>
                        
                        {task?.assignedTo && (
                          <Tooltip title={task.assignedTo?.name || 'Assignee'}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                              {task.assignedTo?.name?.charAt(0) || '?'}
                            </Avatar>
                          </Tooltip>
                        )}
                        
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleDeleteTask(task._id)}
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </ListItem>
                </motion.div>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      {/* Create Task Dialog */}
      <Dialog open={openTaskDialog} onClose={() => setOpenTaskDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Add color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Add New Task</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Task Title"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              required
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              multiline
              rows={3}
              sx={{ mb: 3 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    label="Priority"
                  >
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Due Date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 3 }}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenTaskDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateTask}
            disabled={!newTask.title}
          >
            Create Task
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectDetails;