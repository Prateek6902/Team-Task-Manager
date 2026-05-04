import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, CardActions, Typography,
  Button, LinearProgress, Chip, Avatar, AvatarGroup,
  IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, InputAdornment,
  Tooltip, CircularProgress
} from '@mui/material';
import {
  Add, Search, FilterList, MoreVert, People,
  AccessTime, Delete, Edit, Visibility, SortByAlpha, Folder
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import * as projectService from '../services/projectService';
import toast from 'react-hot-toast';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    tags: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjects();
      const projectsData = response.data || response.projects || [];
      setProjects(Array.isArray(projectsData) ? projectsData : []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      if (!newProject.name.trim()) {
        toast.error('Project name is required');
        return;
      }

      const response = await projectService.createProject({
        name: newProject.name.trim(),
        description: newProject.description.trim(),
        tags: newProject.tags ? newProject.tags.split(',').map(tag => tag.trim()).filter(Boolean) : []
      });
      
      const createdProject = response.data || response.project || response;
      setProjects(prev => [createdProject, ...prev]);
      setOpenDialog(false);
      setNewProject({ name: '', description: '', tags: '' });
      toast.success('Project created successfully! 🎉');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.deleteProject(projectId);
        setProjects(prev => prev.filter(p => p._id !== projectId));
        toast.success('Project deleted');
      } catch (error) {
        console.error('Error deleting project:', error);
        toast.error('Failed to delete project');
      }
    }
  };

  // ... rest of your Projects component stays the same ...
};

export default Projects;
