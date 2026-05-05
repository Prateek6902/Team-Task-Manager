import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button,
  TextField, MenuItem, InputAdornment, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, Paper, Tabs, Tab
} from '@mui/material';
import {
  Add, Search, AccessTime, PriorityHigh,
  Edit, Delete
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import * as taskService from '../services/taskService';
import toast from 'react-hot-toast';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '', status: '', priority: '', sort: '-createdAt'
  });
  const [view, setView] = useState('list');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    title: '', description: '', project: '',
    assignedTo: '', dueDate: '', priority: 'medium', status: 'todo'
  });

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
  try {
    setLoading(true);

    const res = await taskService.getTasks(filters);
    const data = res.data.data || [];

    setTasks(data);

  } catch (error) {
    console.error('Error fetching tasks:', error);
    setTasks([]);
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = async () => {
    try {
      if (editingTask) {
        await taskService.updateTask(editingTask._id, formData);
        toast.success('Task updated successfully');
      } else {
        await taskService.createTask(formData);
        toast.success('Task created successfully');
      }
      setOpenDialog(false);
      fetchTasks();
    } catch (error) {
      console.error('Error saving task:', error);
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      try {
        await taskService.deleteTask(deleteConfirm);
        setTasks(prev => prev.filter(t => t._id !== deleteConfirm));
        toast.success('Task deleted');
      } catch (error) {
        toast.error('Failed to delete task');
      } finally {
        setDeleteConfirm(null);
      }
    }
  };
  const handleOpenDialog = (task = null) => {
  if (task) {
    setEditingTask(task);
    setFormData(task);
  } else {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      project: '',
      assignedTo: '',
      dueDate: '',
      priority: 'medium',
      status: 'todo'
    });
  }
  setOpenDialog(true);
};
  
  const getPriorityColor = (priority) => {
    const colors = { urgent: 'error', high: 'warning', medium: 'info', low: 'success' };
    return colors[priority] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = { 'todo': 'default', 'in-progress': 'warning', 'review': 'info', 'done': 'success' };
    return colors[status] || 'default';
  };

  const kanbanColumns = [
    { id: 'todo', title: 'To Do', color: '#6C63FF' },
    { id: 'in-progress', title: 'In Progress', color: '#FFA726' },
    { id: 'review', title: 'Review', color: '#29B6F6' },
    { id: 'done', title: 'Done', color: '#66BB6A' }
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700 }}>Tasks</Typography>
              <Typography variant="body1" color="text.secondary">Manage and track all your tasks</Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tabs value={view} onChange={(e, v) => setView(v)}>
                <Tab value="list" label="List" />
                <Tab value="kanban" label="Kanban" />
              </Tabs>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{ background: 'linear-gradient(45deg, #6C63FF, #FF6B6B)' }}
              >
                Add Task
              </Button>
            </Box>
          </Box>
        </motion.div>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search tasks..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              InputProps={{ startAdornment: <InputAdornment position="start"><Search /></InputAdornment> }}
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })} label="Status">
                <MenuItem value="">All</MenuItem>
                <MenuItem value="todo">To Do</MenuItem>
                <MenuItem value="in-progress">In Progress</MenuItem>
                <MenuItem value="review">Review</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select value={filters.priority} onChange={(e) => setFilters({ ...filters, priority: e.target.value })} label="Priority">
                <MenuItem value="">All</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="low">Low</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading */}
      {loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography color="text.secondary">Loading tasks...</Typography>
        </Box>
      )}

      {/* Tasks List/Empty State */}
      {!loading && tasks.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>No tasks found</Typography>
          <Button variant="outlined" startIcon={<Add />} onClick={() => handleOpenDialog()}>
            Create your first task
          </Button>
        </Box>
      )}

      {/* Task List View */}
      {!loading && tasks.length > 0 && view === 'list' && (
        <Box>
          {tasks.map((task, index) => (
            <motion.div key={task._id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
              <Card sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>{task.title}</Typography>
                      <Typography variant="body2" color="text.secondary">{task.description}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip label={task.status} size="small" color={getStatusColor(task.status)} />
                      <Chip label={task.priority} size="small" color={getPriorityColor(task.priority)} />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="caption" color="text.secondary">
                      {task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : 'No date'}
                    </Typography>
                    <Box sx={{ flex: 1 }} />
                    <IconButton size="small" onClick={() => handleOpenDialog(task)}><Edit fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteConfirm(task._id)}><Delete fontSize="small" /></IconButton>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={Boolean(deleteConfirm)} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Delete Task</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this task?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Create/Edit Task Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField fullWidth label="Task Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required sx={{ mb: 3 }} />
            <TextField fullWidth label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={3} sx={{ mb: 3 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} label="Priority">
                    <MenuItem value="low">Low</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="high">High</MenuItem>
                    <MenuItem value="urgent">Urgent</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Status</InputLabel>
                  <Select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} label="Status">
                    <MenuItem value="todo">To Do</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="review">Review</MenuItem>
                    <MenuItem value="done">Done</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField fullWidth type="date" label="Due Date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} InputLabelProps={{ shrink: true }} sx={{ mb: 3 }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!formData.title || !formData.dueDate}>
            {editingTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Tasks;

  // ... rest of your Tasks component stays the same ...

