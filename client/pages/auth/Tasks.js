import React, { useState } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  Tooltip,
  Paper,
  Tabs,
  Tab
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  AccessTime,
  Person,
  PriorityHigh,
  Edit,
  Delete,
  DragIndicator
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useTasks } from '../hooks/useTasks';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';

const Tasks = () => {
  const {
    tasks,
    loading,
    filters,
    addTask,
    editTask,
    removeTask,
    changeTaskStatus,
    updateFilters
  } = useTasks();

  const [view, setView] = useState('list'); // 'list' or 'kanban'
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium',
    status: 'todo'
  });

  const handleOpenDialog = (task = null) => {
    if (task) {
      setEditingTask(task);
      setFormData({
        title: task.title,
        description: task.description || '',
        project: task.project?._id || task.project || '',
        assignedTo: task.assignedTo?._id || task.assignedTo || '',
        dueDate: task.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '',
        priority: task.priority,
        status: task.status
      });
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

  const handleSubmit = async () => {
    if (editingTask) {
      await editTask(editingTask._id, formData);
    } else {
      await addTask(formData);
    }
    setOpenDialog(false);
  };

  const handleDelete = async () => {
    if (deleteConfirm) {
      await removeTask(deleteConfirm);
      setDeleteConfirm(null);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'error',
      high: 'warning',
      medium: 'info',
      low: 'success'
    };
    return colors[priority] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      'todo': 'default',
      'in-progress': 'warning',
      'review': 'info',
      'done': 'success'
    };
    return colors[status] || 'default';
  };

  const kanbanColumns = [
    { id: 'todo', title: 'To Do', color: '#6C63FF' },
    { id: 'in-progress', title: 'In Progress', color: '#FFA726' },
    { id: 'review', title: 'Review', color: '#29B6F6' },
    { id: 'done', title: 'Done', color: '#66BB6A' }
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Tasks
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage and track all your tasks
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Tabs value={view} onChange={(e, v) => setView(v)} sx={{ mr: 2 }}>
                <Tab value="list" label="List" />
                <Tab value="kanban" label="Kanban" />
              </Tabs>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
                sx={{
                  background: 'linear-gradient(45deg, #6C63FF, #FF6B6B)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5A52E0, #F55B5B)',
                  }
                }}
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
              onChange={(e) => updateFilters({ search: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} sm={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                onChange={(e) => updateFilters({ status: e.target.value })}
                label="Status"
              >
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
              <Select
                value={filters.priority}
                onChange={(e) => updateFilters({ priority: e.target.value })}
                label="Priority"
              >
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

      {/* Tasks View */}
      {tasks.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description="Create your first task to get started"
          actionLabel="Create Task"
          onAction={() => handleOpenDialog()}
        />
      ) : view === 'list' ? (
        <Box>
          {tasks.map((task, index) => (
            <motion.div
              key={task._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card sx={{ mb: 2, '&:hover': { boxShadow: 6 } }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {task.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {task.description}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, ml: 2 }}>
                      <Chip
                        label={task.status}
                        size="small"
                        color={getStatusColor(task.status)}
                      />
                      <Chip
                        label={task.priority}
                        size="small"
                        color={getPriorityColor(task.priority)}
                        icon={task.priority === 'urgent' ? <PriorityHigh /> : undefined}
                      />
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                      </Typography>
                    </Box>
                    {task.assignedTo && (
                      <Tooltip title={task.assignedTo.name}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: '0.8rem' }}>
                          {task.assignedTo.name?.charAt(0)}
                        </Avatar>
                      </Tooltip>
                    )}
                    <Box sx={{ flex: 1 }} />
                    <IconButton size="small" onClick={() => handleOpenDialog(task)}>
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setDeleteConfirm(task._id)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </Box>
      ) : (
        <Grid container spacing={2}>
          {kanbanColumns.map(column => (
            <Grid item xs={12} sm={6} md={3} key={column.id}>
              <Paper sx={{ p: 2, bgcolor: '#f5f5f5', minHeight: 400 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, mb: 2, color: column.color }}
                >
                  {column.title} ({tasks.filter(t => t.status === column.id).length})
                </Typography>
                {tasks
                  .filter(t => t.status === column.id)
                  .map(task => (
                    <Card key={task._id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {task.title}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                          <Chip
                            label={task.priority}
                            size="small"
                            color={getPriorityColor(task.priority)}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(task.dueDate), 'MMM dd')}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Task Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTask ? 'Edit Task' : 'Create New Task'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Task Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              sx={{ mb: 3 }}
            />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Priority</InputLabel>
                  <Select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    label="Status"
                  >
                    <MenuItem value="todo">To Do</MenuItem>
                    <MenuItem value="in-progress">In Progress</MenuItem>
                    <MenuItem value="review">Review</MenuItem>
                    <MenuItem value="done">Done</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField
              fullWidth
              type="date"
              label="Due Date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              sx={{ mb: 3 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.title || !formData.dueDate}
          >
            {editingTask ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={Boolean(deleteConfirm)}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmColor="error"
      />
    </Box>
  );
};

export default Tasks;