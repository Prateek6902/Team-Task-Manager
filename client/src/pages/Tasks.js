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
    const data = res.data || res;

    setTasks(Array.isArray(data) ? data : []);

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

  // ... rest of your Tasks component stays the same ...
};

export default Tasks;
