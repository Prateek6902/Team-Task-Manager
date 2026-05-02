import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  LinearProgress,
  Chip,
  Avatar,
  AvatarGroup,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  InputAdornment,
  Tooltip
} from '@mui/material';
import {
  Add,
  Search,
  FilterList,
  MoreVert,
  People,
  AccessTime,
  TrendingUp,
  Delete,
  Edit,
  Visibility,
  SortByAlpha
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
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
      const response = await axios.get('http://localhost:5000/api/projects');
      setProjects(response.data.projects);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load projects');
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/projects', {
        name: newProject.name,
        description: newProject.description,
        tags: newProject.tags.split(',').map(tag => tag.trim()).filter(Boolean)
      });
      
      setProjects([response.data.project, ...projects]);
      setOpenDialog(false);
      setNewProject({ name: '', description: '', tags: '' });
      toast.success('Project created successfully! 🎉');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create project');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await axios.delete(`http://localhost:5000/api/projects/${projectId}`);
        setProjects(projects.filter(p => p._id !== projectId));
        toast.success('Project deleted');
      } catch (error) {
        toast.error('Failed to delete project');
      }
    }
  };

  const filteredProjects = projects
    .filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === 'progress') return b.progress - a.progress;
      return 0;
    });

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
              <Typography variant="h6" sx={{ fontWeight: 600, flex: 1, mr: 1 }}>
                {project.name}
              </Typography>
              <IconButton size="small">
                <MoreVert />
              </IconButton>
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
              {project.description || 'No description'}
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Progress
                </Typography>
                <Typography variant="caption" color="primary" fontWeight={600}>
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
                    background: 'linear-gradient(90deg, #6C63FF, #FF6B6B)',
                  }
                }} 
              />
            </Box>

            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {project.tags?.map((tag, idx) => (
                <Chip
                  key={idx}
                  label={tag}
                  size="small"
                  variant="outlined"
                  sx={{ borderRadius: 1 }}
                />
              ))}
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 30, height: 30 } }}>
                {project.members?.map((member, idx) => (
                  <Tooltip key={idx} title={member.user?.name || 'Member'}>
                    <Avatar sx={{ bgcolor: `hsl(${idx * 60}, 70%, 60%)` }}>
                      {member.user?.name?.charAt(0) || 'M'}
                    </Avatar>
                  </Tooltip>
                ))}
              </AvatarGroup>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <AccessTime sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                </Typography>
              </Box>
            </Box>
          </CardContent>
          
          <CardActions sx={{ p: 2, pt: 0, justifyContent: 'space-between' }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Visibility />}
              onClick={() => navigate(`/projects/${project._id}`)}
            >
              View Details
            </Button>
            <IconButton 
              size="small" 
              color="error"
              onClick={() => handleDeleteProject(project._id)}
            >
              <Delete />
            </IconButton>
          </CardActions>
        </Card>
      </motion.div>
    </Grid>
  );

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Projects
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and track your team projects
          </Typography>
        </motion.div>
      </Box>

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

      <Grid container spacing={3}>
        {filteredProjects.map((project, index) => (
          <ProjectCard key={project._id} project={project} index={index} />
        ))}
      </Grid>

      {!loading && filteredProjects.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No projects found
            </Typography>
            <Button variant="outlined" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
              Create your first project
            </Button>
          </motion.div>
        </Box>
      )}

      {/* Create Project Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Add color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Create New Project
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Project Name"
              value={newProject.name}
              onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
              required
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              multiline
              rows={3}
              sx={{ mb: 3 }}
            />
            <TextField
              fullWidth
              label="Tags (comma-separated)"
              value={newProject.tags}
              onChange={(e) => setNewProject({ ...newProject, tags: e.target.value })}
              helperText="e.g., frontend, urgent, sprint-1"
              sx={{ mb: 3 }}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleCreateProject}
            disabled={!newProject.name}
          >
            Create Project
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Projects;