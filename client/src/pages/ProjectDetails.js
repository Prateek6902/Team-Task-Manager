import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Button,
  Tabs, Tab, List, ListItem, Chip, LinearProgress,
  Avatar, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem,
  FormControl, InputLabel, Tooltip
} from '@mui/material';
import {
  ArrowBack, Add, Delete, Assignment, AccessTime,
  CheckCircle, Warning, Timeline
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import * as projectService from '../services/projectService';
import * as taskService from '../services/taskService';
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
    if (id) fetchProjectDetails();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const [projectResponse, tasksResponse] = await Promise.all([
        projectService.getProject(id),
        taskService.getTasks({ project: id })
      ]);
      
      setProject(projectResponse.data || projectResponse.project || {});
      const tasksData = tasksResponse.data || tasksResponse.tasks || [];
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

      const response = await taskService.createTask(taskData);
      const createdTask = response.data || response.task || response;
      setTasks(prev => [createdTask, ...prev]);
      setOpenTaskDialog(false);
      setNewTask({
        title: '', description: '', assignedTo: '',
        dueDate: '', priority: 'medium', status: 'todo'
      });
      toast.success('Task created successfully! 📝');
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error(error.response?.data?.message || 'Failed to create task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await taskService.updateTaskStatus(taskId, newStatus);
      const updatedTask = response.data || response.task || response;
      setTasks(prev => prev.map(task => 
        task._id === taskId ? { ...task, ...updatedTask } : task
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
        await taskService.deleteTask(taskId);
        setTasks(prev => prev.filter(t => t._id !== taskId));
        toast.success('Task deleted');
      } catch (error) {
        console.error('Error deleting task:', error);
        toast.error('Failed to delete task');
      }
    }
  };

  // ... rest of your ProjectDetails component stays the same ...
};

export default ProjectDetails;
