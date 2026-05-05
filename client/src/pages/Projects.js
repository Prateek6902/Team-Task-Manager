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

    const res = await projectService.getProjects();
    const data = res.data || res;

    setProjects(Array.isArray(data) ? data : []);

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
  const getStatusBadge = (status) => {
    const statusConfig = {
      'active': { label: 'Active', color: 'success' },
      'completed': { label: 'Completed', color: 'primary' },
      'archived': { label: 'Archived', color: 'default' }
    };
    const config = statusConfig[status] || statusConfig.active;
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const filteredProjects = Array.isArray(projects) ? projects
    .filter(project => {
      if (!project) return false;
      const matchesSearch = !searchTerm || 
        project.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = !statusFilter || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === 'oldest') return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      if (sortBy === 'progress') return (b.progress || 0) - (a.progress || 0);
      if (sortBy === 'name') return (a.name || '').localeCompare(b.name || '');
      return 0;
    }) : [];

  const ProjectCard = ({ project, index }) => (
    <Grid item xs={12} sm={6} lg={4}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -5 }}
      >
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <CardContent sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
              <Box sx={{ flex: 1, mr: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {project.name || 'Untitled Project'}
                </Typography>
                {getStatusBadge(project.status)}
              </Box>
            </Box>
            
            <Typography 
              variant="body2" 
              color="text.secondary" 
              sx={{ mb: 2, minHeight: 40, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}
            >
              {project.description || 'No description'}
            </Typography>

            {/* Progress Section */}
            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={500}>
                  Progress
                </Typography>
                <Typography variant="caption" color="primary" fontWeight={700}>
                  {project.progress || 0}%
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={project.progress || 0} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: 'rgba(108, 99, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 4,
                    background: `linear-gradient(90deg, #6C63FF ${100 - (project.progress || 0)}%, #4CAF50)`,
                  }
                }} 
              />
              
              {/* Task Count Breakdown */}
              {project.taskCount && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1.5, gap: 0.5 }}>
                  <Tooltip title="To Do">
                    <Chip 
                      icon={<span style={{ fontSize: '12px' }}>📝</span>}
                      label={project.taskCount.todo || 0} 
                      size="small" 
                      variant="outlined"
                      sx={{ fontSize: '0.7rem', height: 22, flex: 1, minWidth: 0 }} 
                    />
                  </Tooltip>
                  <Tooltip title="In Progress">
                    <Chip 
                      icon={<span style={{ fontSize: '12px' }}>🔄</span>}
                      label={project.taskCount.inProgress || 0} 
                      size="small" 
                      variant="outlined"
                      color="warning"
                      sx={{ fontSize: '0.7rem', height: 22, flex: 1, minWidth: 0 }} 
                    />
                  </Tooltip>
                  <Tooltip title="Review">
                    <Chip 
                      icon={<span style={{ fontSize: '12px' }}>👀</span>}
                      label={project.taskCount.review || 0} 
                      size="small" 
                      variant="outlined"
                      color="info"
                      sx={{ fontSize: '0.7rem', height: 22, flex: 1, minWidth: 0 }} 
                    />
                  </Tooltip>
                  <Tooltip title="Done">
                    <Chip 
                      icon={<span style={{ fontSize: '12px' }}>✅</span>}
                      label={project.taskCount.completed || 0} 
                      size="small" 
                      variant="outlined"
                      color="success"
                      sx={{ fontSize: '0.7rem', height: 22, flex: 1, minWidth: 0 }} 
                    />
                  </Tooltip>
                </Box>
              )}
            </Box>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                {project.tags.slice(0, 3).map((tag, idx) => (
                  <Chip
                    key={idx}
                    label={tag}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 1, fontSize: '0.7rem' }}
                  />
                ))}
                {project.tags.length > 3 && (
                  <Chip
                    label={`+${project.tags.length - 3}`}
                    size="small"
                    sx={{ borderRadius: 1, fontSize: '0.7rem' }}
                  />
                )}
              </Box>
            )}

            {/* Footer */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
              <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.8rem' } }}>
                {project.members?.map((member, idx) => (
                  <Tooltip key={idx} title={member.user?.name || 'Member'}>
                    <Avatar sx={{ bgcolor: `hsl(${idx * 60}, 70%, 60%)` }}>
                      {member.user?.name?.charAt(0)?.toUpperCase() || 'M'}
                    </Avatar>
                  </Tooltip>
                ))}
                {(!project.members || project.members.length === 0) && (
                  <Avatar sx={{ bgcolor: 'primary.main' }}>
                    {project.createdBy?.name?.charAt(0)?.toUpperCase() || '?'}
                  </Avatar>
                )}
              </AvatarGroup>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTime sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {project.createdAt 
                    ? formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })
                    : 'Recently'}
                </Typography>
              </Box>
            </Box>
          </CardContent>
          
          <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
            <Button
              size="small"
              variant="contained"
              startIcon={<Visibility />}
              onClick={() => navigate(`/projects/${project._id}`)}
              sx={{ fontSize: '0.8rem' }}
            >
              View Details
            </Button>
            <IconButton 
              size="small" 
              color="error"
              onClick={() => handleDeleteProject(project._id)}
              sx={{ '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.1)' } }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </CardActions>
        </Card>
      </motion.div>
    </Grid>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Projects
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'} found
              </Typography>
            </Box>
          </Box>
        </motion.div>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ flex: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
        
        <TextField
          select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 130 }}
        >
          <MenuItem value="">All Status</MenuItem>
          <MenuItem value="active">Active</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="archived">Archived</MenuItem>
        </TextField>

        <TextField
          select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          size="small"
          sx={{ minWidth: 150 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SortByAlpha />
              </InputAdornment>
            ),
          }}
        >
          <MenuItem value="newest">Newest First</MenuItem>
          <MenuItem value="oldest">Oldest First</MenuItem>
          <MenuItem value="progress">By Progress</MenuItem>
          <MenuItem value="name">By Name</MenuItem>
        </TextField>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
          sx={{ 
            background: 'linear-gradient(45deg, #6C63FF, #FF6B6B)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5A52E0, #F55B5B)',
            }
          }}
        >
          New Project
        </Button>
      </Box>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <Grid container spacing={3}>
          {filteredProjects.map((project, index) => (
            <ProjectCard key={project._id} project={project} index={index} />
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <Folder sx={{ fontSize: 80, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              {searchTerm || statusFilter ? 'No projects match your filters' : 'No projects yet'}
            </Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
              {searchTerm || statusFilter ? 'Try adjusting your search or filters' : 'Create your first project to get started'}
            </Typography>
            {!searchTerm && !statusFilter && (
              <Button 
                variant="contained" 
                startIcon={<Add />} 
                onClick={() => setOpenDialog(true)}
              >
                Create First Project
              </Button>
            )}
          </motion.div>
        </Box>
      )}

      {/* Create Project Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Folder color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Create New Project
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Project Name *"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              required
              sx={{ mb: 3 }}
              placeholder="Enter project name"
            />
            <TextField
              fullWidth
              label="Description"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              multiline
              rows={3}
              sx={{ mb: 3 }}
              placeholder="Describe your project (optional)"
            />
            <TextField
              fullWidth
              label="Tags (comma-separated)"
              value={newProject.tags}
              onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
              helperText="e.g., frontend, urgent, sprint-1"
              sx={{ mb: 1 }}
              placeholder="Add tags to categorize your project"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateProject}
            disabled={!newProject.name.trim()}
          >
            Create Project
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects;

  // ... rest of your Projects component stays the same ...

